const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const { generateToken, requireAdmin } = require('../middleware/auth');
const { getKBInventory, refreshCache } = require('../services/kbSelector');

const router = express.Router();

// Multer: memory storage for PDF uploads (max 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype === 'application/pdf' || (file.mimetype === 'application/octet-stream' && (file.originalname || '').toLowerCase().endsWith('.pdf'));
    if (ok) cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

const KB_BASE_PATH = path.join(__dirname, '../../kb');

// In-memory media store for demo mode (persists for the lifetime of the server process)
let demoMediaItems = [
  {
    id: 'media-001',
    deal_id: '00000000-0000-0000-0000-000000000001',
    type: 'image',
    label: 'Aerial View',
    url: '/images/fairmont-aerial.jpg',
    sort_order: 1,
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'media-002',
    deal_id: '00000000-0000-0000-0000-000000000001',
    type: 'image',
    label: 'Clubhouse Exterior',
    url: '/images/fairmont-clubhouse.jpg',
    sort_order: 2,
    created_at: '2026-02-15T10:05:00Z',
  },
  {
    id: 'media-003',
    deal_id: '00000000-0000-0000-0000-000000000001',
    type: 'image',
    label: 'Renovated Unit Interior',
    url: '/images/fairmont-interior.jpg',
    sort_order: 3,
    created_at: '2026-02-15T10:10:00Z',
  },
  {
    id: 'media-004',
    deal_id: '00000000-0000-0000-0000-000000000001',
    type: 'video',
    label: 'Property Walkthrough',
    url: '/videos/fairmont-walkthrough.mp4',
    sort_order: 4,
    created_at: '2026-02-20T14:30:00Z',
  },
];

// Demo investors for when Supabase is not connected
const DEMO_INVESTORS = [
  {
    id: 'inv-001',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    investment_goal: 'cash_flow',
    syndication_experience: '1-3 deals',
    target_range: '$250K-$500K',
    engagement_score: 67,
    sections_viewed: ['property', 'market', 'financials', 'team', 'business-plan'],
    chat_message_count: 8,
    last_visit: '2026-03-05T15:42:00Z',
    ppm_requested: true,
    interest_indicated: false,
  },
  {
    id: 'inv-002',
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah.chen@example.com',
    investment_goal: 'appreciation',
    syndication_experience: '4+ deals',
    target_range: '$500K-$1M',
    engagement_score: 82,
    sections_viewed: ['property', 'market', 'financials', 'team', 'business-plan', 'documents'],
    chat_message_count: 14,
    last_visit: '2026-03-05T11:20:00Z',
    ppm_requested: true,
    interest_indicated: true,
  },
  {
    id: 'inv-003',
    first_name: 'Michael',
    last_name: 'Torres',
    email: 'michael.torres@example.com',
    investment_goal: 'tax_benefits',
    syndication_experience: 'first deal',
    target_range: '$100K-$250K',
    engagement_score: 34,
    sections_viewed: ['property', 'market'],
    chat_message_count: 3,
    last_visit: '2026-03-04T09:15:00Z',
    ppm_requested: false,
    interest_indicated: false,
  },
  {
    id: 'inv-004',
    first_name: 'Rebecca',
    last_name: 'Okafor',
    email: 'rebecca.okafor@example.com',
    investment_goal: 'cash_flow',
    syndication_experience: '1-3 deals',
    target_range: '$100K-$250K',
    engagement_score: 55,
    sections_viewed: ['property', 'financials', 'team', 'documents'],
    chat_message_count: 6,
    last_visit: '2026-03-05T08:30:00Z',
    ppm_requested: true,
    interest_indicated: false,
  },
  {
    id: 'inv-005',
    first_name: 'David',
    last_name: 'Patel',
    email: 'david.patel@example.com',
    investment_goal: 'appreciation',
    syndication_experience: '4+ deals',
    target_range: '$1M+',
    engagement_score: 91,
    sections_viewed: ['property', 'market', 'financials', 'team', 'business-plan', 'documents'],
    chat_message_count: 22,
    last_visit: '2026-03-05T16:05:00Z',
    ppm_requested: true,
    interest_indicated: true,
  },
];

// ---------------------------------------------------------------------------
// POST /api/admin/login — Admin authentication (BEFORE auth middleware)
// ---------------------------------------------------------------------------
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const adminEmails = process.env.ADMIN_EMAILS;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmails || !adminPassword) {
      return res.status(500).json({
        message: 'Admin credentials not configured. Set ADMIN_EMAILS and ADMIN_PASSWORD environment variables.',
      });
    }

    const allowedEmails = adminEmails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!allowedEmails.includes(email.toLowerCase())) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password: bcrypt hash if stored as $2b$..., else constant-time plaintext compare.
    // Production deployments should pre-hash the password with bcrypt.
    let passwordMatch = false;
    if (adminPassword.startsWith('$2b$')) {
      passwordMatch = await bcrypt.compare(password, adminPassword);
    } else {
      const submittedBuf = Buffer.from(password);
      const storedBuf = Buffer.from(adminPassword);
      if (submittedBuf.length === storedBuf.length) {
        passwordMatch = crypto.timingSafeEqual(submittedBuf, storedBuf);
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ email: email.toLowerCase(), is_admin: true });
    res.json({ token, email: email.toLowerCase() });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Auth enforcement — all routes below require admin JWT
// ---------------------------------------------------------------------------
router.use(requireAdmin);

// ---------------------------------------------------------------------------
// GET /api/admin/deals — List all deals
// ---------------------------------------------------------------------------
router.get('/deals', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('deals')
        .select('id, slug, name, status, city, state, total_units, total_raise, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ deals: data || [] });
    }

    const { DEMO_DEAL } = require('../services/demoData');
    res.json({ deals: [DEMO_DEAL] });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/deals/:id — Full deal details
// ---------------------------------------------------------------------------
router.get('/deals/:id', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ message: 'Deal not found' });
      return res.json({ deal: data });
    }

    const { DEMO_DEAL } = require('../services/demoData');
    if (req.params.id === DEMO_DEAL.id) {
      return res.json({ deal: DEMO_DEAL });
    }
    res.status(404).json({ message: 'Deal not found' });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/deals — Create new deal
// ---------------------------------------------------------------------------
router.post('/deals', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(501).json({ message: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('deals')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json({ deal: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/deals/:id — Update deal
// ---------------------------------------------------------------------------
router.put('/deals/:id', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(501).json({ message: 'Database not configured' });
    }

    const body = { ...req.body };
    const pr = body.preferred_return != null ? Number(body.preferred_return) / 100 : null;
    const lp = body.lp_split != null ? Number(body.lp_split) / 100 : null;
    const gp = body.gp_split != null ? Number(body.gp_split) / 100 : null;

    if (body.minimum_investment != null) {
      body.min_investment = Number(body.minimum_investment);
      delete body.minimum_investment;
    }
    if (pr != null && (lp != null || gp != null)) {
      body.waterfall_terms = {
        ...(body.waterfall_terms || {}),
        pref_rate: pr,
        split_above_hurdle_1: { lp: lp ?? 0.7, gp: gp ?? 0.3 },
      };
      delete body.preferred_return;
      delete body.lp_split;
      delete body.gp_split;
    }
    if (body.acquisition_fee != null || body.asset_management_fee != null || body.property_management_fee != null || body.disposition_fee != null) {
      body.fees = {
        acquisition_fee_pct: body.acquisition_fee != null ? Number(body.acquisition_fee) : undefined,
        loan_guarantee_fee_pct: body.loan_guarantee_fee != null ? Number(body.loan_guarantee_fee) : undefined,
        asset_management_fee_pct: body.asset_management_fee != null ? Number(body.asset_management_fee) : undefined,
        property_management_fee_pct: body.property_management_fee != null ? Number(body.property_management_fee) : undefined,
        disposition_fee_pct: body.disposition_fee != null ? Number(body.disposition_fee) : undefined,
      };
      delete body.acquisition_fee;
      delete body.asset_management_fee;
      delete body.loan_guarantee_fee;
      delete body.property_management_fee;
      delete body.disposition_fee;
    }
    body.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('deals')
      .update(body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ deal: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/deals/:id/publish — Set deal live
// ---------------------------------------------------------------------------
router.post('/deals/:id/publish', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(501).json({ message: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('deals')
      .update({ status: 'live', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ deal: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/deals/:id/sensitivity — Upload sensitivity data
// ---------------------------------------------------------------------------
router.put('/deals/:id/sensitivity', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(501).json({ message: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('deals')
      .update({
        sensitivity_data: req.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('id, slug')
      .single();

    if (error) throw error;
    res.json({ success: true, deal_id: data.id });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/deals/:id/fundraise — Update fundraise percentage
// ---------------------------------------------------------------------------
router.put('/deals/:id/fundraise', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(501).json({ message: 'Database not configured' });
    }

    const { percentage } = req.body;
    const { data, error } = await supabase
      .from('deals')
      .update({
        fundraise_pct: percentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('id')
      .single();

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/deals/:id/analytics — Deal analytics
// ---------------------------------------------------------------------------
router.get('/deals/:id/analytics', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.json({ sessions: 0, avg_engagement: 0, total_chat_messages: 0 });
    }

    const { data: sessions } = await supabase
      .from('sessions')
      .select('total_seconds, engagement_score, chat_message_count, sections_visited, financial_explorer_used')
      .eq('deal_id', req.params.id);

    const stats = {
      total_sessions: sessions?.length || 0,
      avg_engagement_score: sessions?.length
        ? sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / sessions.length
        : 0,
      total_chat_messages: sessions?.reduce((sum, s) => sum + (s.chat_message_count || 0), 0) || 0,
      avg_time_seconds: sessions?.length
        ? sessions.reduce((sum, s) => sum + (s.total_seconds || 0), 0) / sessions.length
        : 0,
      financial_explorer_usage_pct: sessions?.length
        ? (sessions.filter(s => s.financial_explorer_used).length / sessions.length * 100)
        : 0,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/deals/:id/investors — Investors for a specific deal
// ---------------------------------------------------------------------------
router.get('/deals/:id/investors', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          investor_id,
          engagement_score,
          sections_viewed,
          chat_message_count,
          last_active_at,
          investors (
            id,
            first_name,
            last_name,
            email,
            investment_goal,
            syndication_experience,
            target_range,
            ppm_requested,
            interest_indicated
          )
        `)
        .eq('deal_id', req.params.id)
        .order('last_active_at', { ascending: false });

      if (error) throw error;

      // Aggregate per investor (one investor may have multiple sessions)
      const investorMap = {};
      (data || []).forEach((session) => {
        const inv = session.investors;
        if (!inv) return;
        if (!investorMap[inv.id]) {
          investorMap[inv.id] = {
            ...inv,
            engagement_score: session.engagement_score || 0,
            sections_viewed: session.sections_viewed || [],
            chat_message_count: session.chat_message_count || 0,
            last_visit: session.last_active_at,
          };
        } else {
          // Keep highest engagement score and latest visit
          const existing = investorMap[inv.id];
          if ((session.engagement_score || 0) > existing.engagement_score) {
            existing.engagement_score = session.engagement_score;
          }
          existing.chat_message_count += session.chat_message_count || 0;
          // Merge sections_viewed
          const allSections = new Set([
            ...existing.sections_viewed,
            ...(session.sections_viewed || []),
          ]);
          existing.sections_viewed = Array.from(allSections);
          // Keep latest visit
          if (session.last_active_at > existing.last_visit) {
            existing.last_visit = session.last_active_at;
          }
        }
      });

      return res.json({ investors: Object.values(investorMap) });
    }

    // Demo mode
    res.json({ investors: DEMO_INVESTORS });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/investors — All investors across all deals
// ---------------------------------------------------------------------------
router.get('/investors', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('investors')
        .select(`
          id,
          first_name,
          last_name,
          email,
          investment_goal,
          syndication_experience,
          target_range,
          ppm_requested,
          interest_indicated,
          created_at,
          sessions (
            engagement_score,
            sections_viewed,
            chat_message_count,
            last_active_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const investors = (data || []).map((inv) => {
        const sessions = inv.sessions || [];
        const bestSession = sessions.reduce(
          (best, s) => ((s.engagement_score || 0) > (best.engagement_score || 0) ? s : best),
          { engagement_score: 0, sections_viewed: [], chat_message_count: 0, last_active_at: null }
        );
        // Merge all sections across sessions
        const allSections = new Set();
        sessions.forEach((s) => (s.sections_viewed || []).forEach((sec) => allSections.add(sec)));

        return {
          id: inv.id,
          first_name: inv.first_name,
          last_name: inv.last_name,
          email: inv.email,
          investment_goal: inv.investment_goal,
          syndication_experience: inv.syndication_experience,
          target_range: inv.target_range,
          engagement_score: bestSession.engagement_score || 0,
          sections_viewed: Array.from(allSections),
          chat_message_count: sessions.reduce((sum, s) => sum + (s.chat_message_count || 0), 0),
          last_visit: sessions.reduce(
            (latest, s) => (s.last_active_at && s.last_active_at > latest ? s.last_active_at : latest),
            null
          ),
          ppm_requested: inv.ppm_requested || false,
          interest_indicated: inv.interest_indicated || false,
        };
      });

      return res.json({ investors });
    }

    // Demo mode
    res.json({ investors: DEMO_INVESTORS });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/investors/:id — Single investor detail with chat history
// ---------------------------------------------------------------------------
router.get('/investors/:id', async (req, res, next) => {
  try {
    if (supabase) {
      const { data: investor, error: invError } = await supabase
        .from('investors')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (invError) throw invError;
      if (!investor) return res.status(404).json({ message: 'Investor not found' });

      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('investor_id', req.params.id)
        .order('started_at', { ascending: false });

      // Fetch chat messages from analytics events
      const { data: chatEvents } = await supabase
        .from('analytics_events')
        .select('event_data, created_at')
        .eq('investor_id', req.params.id)
        .eq('event_type', 'chat_message_sent')
        .order('created_at', { ascending: true });

      const chat_history = (chatEvents || []).map((e) => ({
        message: (e.event_data || {}).message || '',
        timestamp: e.created_at,
      }));

      return res.json({
        investor,
        sessions: sessions || [],
        chat_history,
      });
    }

    // Demo mode
    const demoInvestor = DEMO_INVESTORS.find((i) => i.id === req.params.id);
    if (!demoInvestor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    res.json({
      investor: demoInvestor,
      sessions: [
        {
          id: 'sess-001',
          deal_id: '00000000-0000-0000-0000-000000000001',
          started_at: '2026-03-05T14:00:00Z',
          total_seconds: 1260,
          engagement_score: demoInvestor.engagement_score,
          sections_viewed: demoInvestor.sections_viewed,
          chat_message_count: demoInvestor.chat_message_count,
        },
      ],
      chat_history: [
        { message: 'What is the projected IRR for this deal?', timestamp: '2026-03-05T14:05:00Z' },
        { message: 'How does the renovation timeline look?', timestamp: '2026-03-05T14:12:00Z' },
        { message: 'Can you explain the waterfall structure?', timestamp: '2026-03-05T14:18:00Z' },
      ],
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Knowledge Base Routes
// ---------------------------------------------------------------------------

// GET /api/admin/knowledge-base — list all KB files with metadata
router.get('/knowledge-base', (req, res) => {
  const inventory = getKBInventory();
  res.json({
    total_files: inventory.length,
    total_tokens: inventory.reduce((sum, f) => sum + f.estimated_tokens, 0),
    files: inventory,
  });
});

// GET /api/admin/knowledge-base/file/:category/:filename — read a specific KB file
router.get('/knowledge-base/file/:category/:filename', (req, res) => {
  const filePath = `${req.params.category}/${req.params.filename}`;
  try {
    const content = fs.readFileSync(path.join(KB_BASE_PATH, filePath), 'utf-8');
    res.json({ path: filePath, content });
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

// GET /api/admin/knowledge-base/file/:category/:sub/:filename — read deal-specific KB file
router.get('/knowledge-base/file/:category/:sub/:filename', (req, res) => {
  const filePath = `${req.params.category}/${req.params.sub}/${req.params.filename}`;
  try {
    const content = fs.readFileSync(path.join(KB_BASE_PATH, filePath), 'utf-8');
    res.json({ path: filePath, content });
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

// POST /api/admin/knowledge-base — Create or update a KB file
router.post('/knowledge-base', async (req, res, next) => {
  try {
    const { path: filePath, content } = req.body;

    if (!filePath || typeof content !== 'string') {
      return res.status(400).json({ message: 'path and content are required' });
    }

    // Prevent path traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.startsWith('..') || path.isAbsolute(normalizedPath)) {
      return res.status(400).json({ message: 'Invalid file path' });
    }

    const fullPath = path.join(KB_BASE_PATH, normalizedPath);

    // Create directories if needed
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf-8');

    const estimatedTokens = Math.ceil(content.length / 4);

    // Refresh the KB cache so the updated file is served immediately
    refreshCache().catch((err) => console.warn('[KB] Cache refresh failed after save:', err.message));

    res.json({ success: true, path: normalizedPath, tokens: estimatedTokens });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/knowledge-base/*path — Delete a KB file
router.delete('/knowledge-base/*path', async (req, res, next) => {
  try {
    // Express 5 wildcard params return an array of segments
    const filePath = Array.isArray(req.params.path)
      ? req.params.path.join('/')
      : req.params.path;

    // Prevent path traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.startsWith('..') || path.isAbsolute(normalizedPath)) {
      return res.status(400).json({ message: 'Invalid file path' });
    }

    const fullPath = path.join(KB_BASE_PATH, normalizedPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    fs.unlinkSync(fullPath);

    // Refresh the KB cache so the deleted file is no longer served
    refreshCache().catch((err) => console.warn('[KB] Cache refresh failed after delete:', err.message));

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Media CRUD Routes
// ---------------------------------------------------------------------------

// GET /api/admin/deals/:id/media — List media for a deal
router.get('/deals/:id/media', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('deal_media')
        .select('*')
        .eq('deal_id', req.params.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return res.json({ media: data || [] });
    }

    // Demo mode: filter in-memory media by deal id
    const media = demoMediaItems.filter((m) => m.deal_id === req.params.id);
    res.json({ media });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/deals/:id/media — Add a media item
router.post('/deals/:id/media', async (req, res, next) => {
  try {
    const { type, label, url, sort_order, document_role, caption, description, file_type, file_size, pages } = req.body;
    const captionOrLabel = caption || label || '';

    if (supabase) {
      const row = {
        deal_id: req.params.id,
        type: type || 'image',
        caption: captionOrLabel,
        url: url || '',
        sort_order: sort_order ?? 0,
        document_role: document_role || null,
        category: type === 'document' ? 'other' : null,
      };
      const { data, error } = await supabase
        .from('deal_media')
        .insert(row)
        .select()
        .single();

      if (error) throw error;
      return res.json({ media: data });
    }

    // Demo mode: add to in-memory array
    const newItem = {
      id: `media-${Date.now()}`,
      deal_id: req.params.id,
      type: type || 'image',
      label: captionOrLabel,
      caption: captionOrLabel,
      url: url || '',
      sort_order: sort_order ?? demoMediaItems.length + 1,
      document_role: document_role || null,
      description: description || null,
      file_type: file_type || 'PDF',
      file_size: file_size || null,
      pages: pages || null,
      created_at: new Date().toISOString(),
    };
    demoMediaItems.push(newItem);
    res.json({ media: newItem });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/deals/:id/media/upload — Upload PDF to storage, returns { url }
router.post('/deals/:id/media/upload', requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (supabase) {
      const bucket = 'deal-documents';
      const ext = (req.file.originalname || '').split('.').pop() || 'pdf';
      const filename = `${req.params.id}/${Date.now()}-${(req.file.originalname || 'document').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return res.json({ url: urlData.publicUrl });
    }
    return res.status(501).json({ message: 'File upload requires Supabase Storage. Use URL for demo mode.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/deals/:id/media/:mid — Update a media item
router.put('/deals/:id/media/:mid', async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('deal_media')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.mid)
        .eq('deal_id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ media: data });
    }

    // Demo mode: update in-memory
    const index = demoMediaItems.findIndex(
      (m) => m.id === req.params.mid && m.deal_id === req.params.id
    );
    if (index === -1) {
      return res.status(404).json({ message: 'Media item not found' });
    }
    demoMediaItems[index] = { ...demoMediaItems[index], ...req.body, id: req.params.mid, deal_id: req.params.id };
    res.json({ media: demoMediaItems[index] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/deals/:id/media/:mid — Delete a media item
router.delete('/deals/:id/media/:mid', async (req, res, next) => {
  try {
    if (supabase) {
      const { error } = await supabase
        .from('deal_media')
        .delete()
        .eq('id', req.params.mid)
        .eq('deal_id', req.params.id);

      if (error) throw error;
      return res.json({ success: true });
    }

    // Demo mode: remove from in-memory array
    const index = demoMediaItems.findIndex(
      (m) => m.id === req.params.mid && m.deal_id === req.params.id
    );
    if (index === -1) {
      return res.status(404).json({ message: 'Media item not found' });
    }
    demoMediaItems.splice(index, 1);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
