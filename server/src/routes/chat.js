const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { buildSystemPrompt } = require('../services/systemPrompt');
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { selectKBModules, loadKBFiles } = require('../services/kbSelector');
const { hubspotUpdateContactProperties } = require('../services/hubspot');
const { DEMO_DEAL } = require('../services/demoData');

const router = express.Router();

// Load system prompt once at startup
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, '../../kb/system-prompt.md'),
  'utf-8'
);

// Initialize Anthropic client (null if no API key)
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// In-memory chat history fallback per session
const chatHistories = new Map();

/**
 * Load chat history from Supabase. Falls back to in-memory Map.
 * @param {string} sessionId
 * @returns {Promise<Array<{role: string, content: string}>>}
 */
async function loadChatHistory(sessionId) {
  if (!sessionId) return [];

  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(m => ({ role: m.role, content: m.content }));
      }
    } catch (err) {
      console.warn('[Chat] Supabase history load failed, using in-memory fallback:', err.message);
    }
  }

  // Fallback to in-memory
  return (chatHistories.get(sessionId) || []).slice();
}

/**
 * Save a pair of messages (user + assistant) to Supabase.
 * Falls back to in-memory if Supabase fails.
 * @param {string} sessionId
 * @param {string} userMessage
 * @param {string} assistantMessage
 * @param {object|null} hubspotExtract
 */
async function saveChatMessages(sessionId, userMessage, assistantMessage, hubspotExtract) {
  if (!sessionId) return;

  // Always update in-memory as fast fallback
  if (!chatHistories.has(sessionId)) {
    chatHistories.set(sessionId, []);
  }
  chatHistories.get(sessionId).push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: assistantMessage }
  );

  // Persist to Supabase
  if (supabase) {
    try {
      const { error } = await supabase.from('chat_messages').insert([
        { session_id: sessionId, role: 'user', content: userMessage },
        { session_id: sessionId, role: 'assistant', content: assistantMessage, hubspot_properties_extracted: hubspotExtract },
      ]);
      if (error) {
        console.warn('[Chat] Supabase message save failed:', error.message);
      }
    } catch (err) {
      console.warn('[Chat] Supabase message save error:', err.message);
    }
  }

  // Update chat_message_count on session
  if (supabase) {
    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('chat_message_count')
        .eq('id', sessionId)
        .single();

      if (session) {
        await supabase
          .from('sessions')
          .update({ chat_message_count: (session.chat_message_count || 0) + 1 })
          .eq('id', sessionId);
      }
    } catch (err) {
      // Non-critical
    }
  }
}

/**
 * POST /api/chat -- Send message to AI advisor
 *
 * Body: { message, session? }
 * Supports SSE streaming (Accept: text/event-stream) or JSON response.
 * Chat history is loaded server-side — client chatHistory is ignored.
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { message, session = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 2000 characters.' });
    }

    const dealSlug = session.dealSlug || 'parkview-commons';
    const sessionId = session.sessionId || null;

    // --- Load server-side chat history (Supabase → in-memory fallback) ---
    const history = await loadChatHistory(sessionId);

    // --- LAYER 2: Select and load KB modules ---
    const investorProfile = {
      syndication_experience: session.syndicationExperience || null,
      investment_goal: session.investmentGoal || null,
    };

    const selectedModules = selectKBModules(
      message,
      session.currentSection || 'hub',
      investorProfile,
      dealSlug
    );

    const kbFiles = await loadKBFiles(selectedModules);

    // --- LAYER 3: Build session context ---
    const sessionContext = {
      investor: {
        first_name: session.investorName || 'Investor',
        investment_goal: session.investmentGoal || null,
        syndication_experience: session.syndicationExperience || null,
        target_range: session.targetRange || null,
        lead_source: session.leadSource || null,
        current_section: session.currentSection || 'hub',
        sections_visited: session.sectionsVisited || [],
        time_on_site_seconds: session.timeOnSiteSeconds || 0,
      },
      deal: {
        name: session.dealName || DEMO_DEAL.name,
        slug: dealSlug,
      },
    };

    // --- Deal data summary ---
    const dealSummary = [
      `Deal: ${DEMO_DEAL.name}`,
      `Location: ${DEMO_DEAL.city}, ${DEMO_DEAL.state}`,
      `Units: ${DEMO_DEAL.total_units}`,
      `Total Raise: $${(DEMO_DEAL.total_raise / 1_000_000).toFixed(1)}M`,
      `Purchase Price: $${(DEMO_DEAL.purchase_price / 1_000_000).toFixed(1)}M`,
      `Target IRR (Base): ${(DEMO_DEAL.target_irr_base * 100).toFixed(1)}%`,
      `Target Equity Multiple: ${DEMO_DEAL.target_equity_multiple}x`,
      `Target CoC: ${(DEMO_DEAL.target_coc * 100).toFixed(1)}%`,
      `Hold Period: ${DEMO_DEAL.projected_hold_years} years`,
      `Min Investment: $${(DEMO_DEAL.min_investment / 1_000).toFixed(0)}K`,
      `Pref Rate: ${(DEMO_DEAL.waterfall_terms.pref_rate * 100).toFixed(0)}%`,
      `Split: ${(DEMO_DEAL.waterfall_terms.split_above_hurdle_1.lp * 100).toFixed(0)}/${(DEMO_DEAL.waterfall_terms.split_above_hurdle_1.gp * 100).toFixed(0)} LP/GP`,
      `Loan: $${(DEMO_DEAL.deal_terms.loan_amount / 1_000_000).toFixed(1)}M at ${(DEMO_DEAL.deal_terms.interest_rate * 100).toFixed(1)}%`,
      `Cost Seg Year 1 Depreciation: ${(DEMO_DEAL.cost_seg_data.year_1_accelerated_depreciation_pct * 100).toFixed(0)}% of invested capital`,
    ].join('\n');

    // --- ASSEMBLE FULL SYSTEM PROMPT ---
    // Use returning visitor context if provided in session
    const basePrompt = buildSystemPrompt({
      is_returning: session.isReturning || false,
      first_name: session.investorName || '',
      last_sections_visited: session.lastSectionsVisited || [],
    });

    const fullSystemPrompt = [
      basePrompt,
      '\n\n---\n\n## KNOWLEDGE BASE CONTEXT\n',
      'The following reference materials are relevant to this conversation:\n\n',
      ...kbFiles.map(kb => `### Source: ${kb.path}\n${kb.content}\n\n---\n`),
      '\n\n## DEAL DATA SUMMARY\n',
      dealSummary,
      '\n\n## CURRENT SESSION CONTEXT\n',
      '```json\n' + JSON.stringify(sessionContext, null, 2) + '\n```',
    ].join('\n');

    // --- BUILD MESSAGES ARRAY from server-side history ---
    const trimmedHistory = history.slice(-20);
    const messages = [
      ...trimmedHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // --- CHECK FOR STREAMING ---
    const useStreaming = req.headers.accept === 'text/event-stream';

    // --- DEMO MODE (no API key) ---
    if (!anthropic) {
      const demoResponse = getDemoResponse(message, DEMO_DEAL);
      const parsed = parseResponseCommands(demoResponse);

      // Save messages
      await saveChatMessages(sessionId, message, parsed.cleanText, null);

      if (useStreaming) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ type: 'text', text: parsed.cleanText })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'done', cleanText: parsed.cleanText })}\n\n`);
        return res.end();
      }

      return res.json({
        response: parsed.cleanText,
        hubspot_extract: null,
        navigate: null,
        demo_mode: true,
        kb_modules_loaded: kbFiles.map(f => f.path),
      });
    }

    // --- LIVE MODE ---
    if (useStreaming) {
      // --- STREAMING RESPONSE ---
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';

      const stream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: fullSystemPrompt,
        messages: messages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.text) {
          fullResponse += event.delta.text;
          res.write(`data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`);
        }
      }

      // Parse structured commands from the full response
      const parsed = parseResponseCommands(fullResponse);

      if (parsed.hubspotExtract) {
        res.write(`data: ${JSON.stringify({ type: 'hubspot_extract', data: parsed.hubspotExtract })}\n\n`);
        syncHubspot(req, parsed.hubspotExtract);
      }
      if (parsed.navigate) {
        res.write(`data: ${JSON.stringify({ type: 'navigate', data: parsed.navigate })}\n\n`);
      }
      if (parsed.dataRequest) {
        res.write(`data: ${JSON.stringify({ type: 'data_request', data: parsed.dataRequest })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: 'done', cleanText: parsed.cleanText })}\n\n`);
      res.end();

      // Save both messages to Supabase + in-memory
      await saveChatMessages(sessionId, message, parsed.cleanText, parsed.hubspotExtract);
    } else {
      // --- NON-STREAMING RESPONSE ---
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: fullSystemPrompt,
        messages: messages,
      });

      const fullResponse = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

      const parsed = parseResponseCommands(fullResponse);

      // HubSpot sync
      if (parsed.hubspotExtract) {
        syncHubspot(req, parsed.hubspotExtract);
      }

      // Save both messages
      await saveChatMessages(sessionId, message, parsed.cleanText, parsed.hubspotExtract);

      res.json({
        response: parsed.cleanText,
        hubspot_extract: parsed.hubspotExtract,
        navigate: parsed.navigate,
        data_request: parsed.dataRequest,
        kb_modules_loaded: kbFiles.map(f => f.path),
        tokens_used: {
          system_prompt_est: Math.ceil(fullSystemPrompt.length / 4),
          kb_content_est: kbFiles.reduce((sum, f) => sum + f.tokens, 0),
        },
      });
    }
  } catch (error) {
    console.error('[Chat] API error:', error.message);

    // If API auth fails, fall back to demo
    if (error.status === 401 || error.status === 403) {
      return res.json({
        response: "I'm currently in demo mode — the AI service isn't connected yet. Once connected, I'll be able to answer detailed questions about Parkview Commons, Gray Capital's track record, tax benefits, and more. For now, feel free to explore the deal room sections directly.",
        hubspot_extract: null,
        navigate: null,
        demo_mode: true,
      });
    }

    res.status(500).json({ error: 'Chat service error. Please try again.' });
  }
});

// POST /api/chat/intake -- Process intake question answers
router.post('/intake', async (req, res, next) => {
  try {
    const { answers, session_id } = req.body;
    let investorEmail = null;

    if (supabase && session_id) {
      const { data: session } = await supabase
        .from('sessions')
        .select('investor_id')
        .eq('id', session_id)
        .single();

      if (session?.investor_id) {
        const { data: investor } = await supabase
          .from('investors')
          .update({
            investment_goal: answers.investment_goal || null,
            syndication_experience: answers.syndication_experience || null,
            target_range: answers.target_range || null,
            lead_source: answers.lead_source || null,
          })
          .eq('id', session.investor_id)
          .select('email')
          .single();

        investorEmail = investor?.email;
      }
    }

    if (!investorEmail) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          investorEmail = decoded.email;
        } catch {}
      }
    }

    if (investorEmail && answers) {
      hubspotUpdateContactProperties(investorEmail, answers).catch(err => {
        console.warn('[HubSpot] Intake sync failed:', err.message);
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * Parse structured command blocks from the assistant's response.
 */
function parseResponseCommands(text) {
  let cleanText = text;
  let hubspotExtract = null;
  let navigate = null;
  let dataRequest = null;

  const hubspotMatch = text.match(/:::hubspot\s*\n([\s\S]*?)\n:::/);
  if (hubspotMatch) {
    try {
      const parsed = JSON.parse(hubspotMatch[1]);
      hubspotExtract = parsed.hubspot_extract || parsed;
      cleanText = cleanText.replace(hubspotMatch[0], '').trim();
    } catch (e) {
      console.warn('[Chat] Failed to parse hubspot extract:', e.message);
    }
  }

  const navMatch = text.match(/:::navigate\s*\n([\s\S]*?)\n:::/);
  if (navMatch) {
    try {
      navigate = JSON.parse(navMatch[1]);
      cleanText = cleanText.replace(navMatch[0], '').trim();
    } catch (e) {
      console.warn('[Chat] Failed to parse navigate command:', e.message);
    }
  }

  const dataMatch = text.match(/:::data_request\s*\n([\s\S]*?)\n:::/);
  if (dataMatch) {
    try {
      dataRequest = JSON.parse(dataMatch[1]);
      cleanText = cleanText.replace(dataMatch[0], '').trim();
    } catch (e) {
      console.warn('[Chat] Failed to parse data request:', e.message);
    }
  }

  const legacyNav = cleanText.match(/NAVIGATE:(\w+)/);
  if (legacyNav && !navigate) {
    navigate = { section: legacyNav[1] };
    cleanText = cleanText.replace(/NAVIGATE:\w+\n?/, '').trim();
  }

  const legacyHS = cleanText.match(/HUBSPOT_EXTRACT:(\{.*\})/);
  if (legacyHS && !hubspotExtract) {
    try {
      hubspotExtract = JSON.parse(legacyHS[1]);
      cleanText = cleanText.replace(/HUBSPOT_EXTRACT:\{.*\}\n?/, '').trim();
    } catch {}
  }

  return { cleanText, hubspotExtract, navigate, dataRequest };
}

/**
 * Async HubSpot sync from chat extraction (non-blocking).
 */
function syncHubspot(req, hubspotExtract) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email && hubspotExtract?.properties) {
      hubspotUpdateContactProperties(decoded.email, hubspotExtract.properties).catch(err => {
        console.warn('[HubSpot] Chat extract sync failed:', err.message);
      });
    }
  } catch {}
}

/**
 * Demo response generator -- keyword matching for when no API key is set.
 */
function getDemoResponse(message, deal) {
  const lower = message.toLowerCase();

  if (lower.match(/return|irr|multiple|yield|project/)) {
    return `For ${deal.name}, we're targeting a ${(deal.target_irr_base * 100).toFixed(1)}% IRR and ${deal.target_equity_multiple}x equity multiple under our Base Case scenario. The Conservative scenario projects lower returns with more defensive assumptions, while the Upside and Strategic scenarios model higher rent growth and tighter exit caps. You can explore all four scenarios interactively in the Financial Explorer — would you like me to take you there?\n\nThese are projections based on current assumptions — actual results may differ.`;
  }

  if (lower.match(/tax|depreci|k-?1|cost seg|deduct/)) {
    return `Great question. We perform a cost segregation study on every acquisition. For ${deal.name}, we estimate approximately ${(deal.cost_seg_data.year_1_accelerated_depreciation_pct * 100).toFixed(0)}% of your invested capital as year-one accelerated depreciation. On a $100K investment, that's roughly $${(deal.cost_seg_data.estimated_year_1_paper_loss_per_100k / 1000).toFixed(0)}K in paper losses. At a 37% marginal rate, that's about $${Math.round(deal.cost_seg_data.estimated_year_1_paper_loss_per_100k * 0.37 / 1000)}K in estimated tax savings.\n\nThe Tax Impact Estimator in the Financial Explorer lets you model this at your specific tax bracket. We recommend consulting your tax advisor for your specific situation.`;
  }

  if (lower.match(/track record|past|perform|history|previous/)) {
    return "Gray Capital has realized 5 deals with a weighted average IRR of 18.4% and a 1.92x equity multiple. Zero capital losses across 8+ years. Our best performer was Riverside Terrace at 22.1% IRR. Our most instructive was Timber Ridge — navigated COVID and still delivered 17.2%.\n\nPast performance is not indicative of future results.";
  }

  if (lower.match(/fee|cost|promote|charge|expense|how.*make money/)) {
    return "Full transparency: 2% acquisition fee, 2% annual asset management fee, 5% construction management fee, and 1% disposition fee. Our promote is 30% of profits above the 8% preferred return — and there's no GP catch-up, which is more investor-friendly than most sponsors. We believe in alignment — we invest our own capital alongside our LPs in every deal.";
  }

  if (lower.match(/risk|downside|lose|protect|worst/)) {
    return `The main risks are market risk, interest rate risk, execution risk, and illiquidity. We mitigate these through conservative underwriting (our Conservative case uses 2% rent growth and 5.75% exit cap), fixed-rate debt, $800K+ operating reserves, and in-house property management via Gray Residential. To date, we've had zero capital losses across our portfolio.\n\nPast performance is not indicative of future results.`;
  }

  if (lower.match(/process|how.*invest|start|next step|subscribe/)) {
    return "Here's how it works: 1) You're already exploring the deal room — great start. 2) Schedule a call with Griffin or Blake if you have questions. 3) Request and review the PPM. 4) Complete subscription docs via DocuSign. 5) Wire funds. The whole process typically takes 1-2 weeks from decision to funded. Want me to take you to the Documents section to request the PPM?";
  }

  if (lower.match(/who|team|spencer|manage/)) {
    return `Gray Capital was founded by Spencer Gray and is headquartered in Indianapolis. The firm is vertically integrated — Gray Capital handles acquisitions, asset management, and capital markets, while Gray Residential is our in-house property management company with 85 employees.\n\nGriffin Taylor and Blake Morrison on our Investor Relations team are your primary contacts. Would you like to learn more about the team?`;
  }

  return `That's a great question. I'm here to help you understand every aspect of ${deal.name} and Gray Capital's approach. We're targeting a ${(deal.target_irr_base * 100).toFixed(1)}% IRR on this ${deal.total_units}-unit value-add deal in ${deal.city}, ${deal.state}.\n\nFeel free to ask about the financials, our team and track record, the property itself, market dynamics, tax benefits, or the investment process. What interests you most?`;
}

module.exports = router;
