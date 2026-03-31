import { useState, useCallback, useRef } from 'react';
import { useDeal } from '../context/DealContext';
import type { ChatMessage } from '../types/investor';

const DEMO_RESPONSES: Record<string, string> = {
  returns: "In our Base Case scenario, Parkview Commons targets a 14.8% LP IRR with a 1.85x equity multiple over a 5-year hold. The Conservative case projects 10.8%, while the Upside reaches 19.2%. You can explore all four scenarios interactively in the Financial Explorer.\n\nThese are projections based on current assumptions \u2014 actual results may differ.",
  tax: "One of the biggest advantages of this investment is the tax treatment. Through cost segregation, we estimate approximately 60% of the depreciable basis qualifies for accelerated depreciation. For a $100K investment at a 37% tax bracket, that's roughly $16,500 in year-one tax savings. We recommend consulting your tax advisor for your specific situation.",
  'track record': "Gray Capital has realized 5 deals with a weighted average IRR of 18.4% and a 1.92x equity multiple. Zero capital losses across 8+ years. Our best performer was Riverside Terrace at 22.1% IRR. Our most instructive was Timber Ridge \u2014 navigated COVID and still delivered 17.2%.\n\nPast performance is not indicative of future results.",
  fees: "Full transparency: 2% acquisition fee, 2% annual asset management fee, 5% construction management fee, and 1% disposition fee. Our promote is 30% of profits above the 8% preferred return \u2014 and there's no GP catch-up, which is more investor-friendly than most sponsors.",
  risk: "The main risks are market risk, interest rate risk, execution risk, and illiquidity. We mitigate these through conservative underwriting, fixed-rate debt, $800K+ operating reserves, and in-house property management. To date, zero capital losses across our portfolio.\n\nPast performance is not indicative of future results.",
  process: "Here's how it works: 1) You're already exploring the deal room. 2) Schedule a call with Griffin or Blake if you have questions. 3) Request and review the PPM. 4) Complete subscription docs via DocuSign. 5) Wire funds. Whole process typically takes 1-2 weeks from decision to funded.",
  default: "I'm currently in demo mode \u2014 once the API is connected, I'll be able to have a full conversation about Parkview Commons, Gray Capital's track record, tax benefits, and anything else you're curious about. In the meantime, the deal room sections have all the details you need!",
};

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/return|irr|multiple|yield|project/)) return DEMO_RESPONSES.returns;
  if (lower.match(/tax|depreci|k-?1|cost seg|deduct/)) return DEMO_RESPONSES.tax;
  if (lower.match(/track record|past|perform|history|previous/)) return DEMO_RESPONSES['track record'];
  if (lower.match(/fee|cost|promote|charge|expense/)) return DEMO_RESPONSES.fees;
  if (lower.match(/risk|downside|lose|protect|worst/)) return DEMO_RESPONSES.risk;
  if (lower.match(/process|how.*invest|start|next step|subscribe/)) return DEMO_RESPONSES.process;
  return DEMO_RESPONSES.default;
}

export function useChat() {
  const {
    deal,
    investor,
    session,
    chatMessages,
    addChatMessage,
    chatOpen,
    setChatOpen,
    currentSection,
    setCurrentSection,
    sectionsVisited,
    intakeAnswers,
  } = useDeal();

  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef(Date.now());
  const welcomeShownRef = useRef(false);

  const showWelcome = useCallback(() => {
    if (welcomeShownRef.current || chatMessages.length > 0) return;
    welcomeShownRef.current = true;

    const name = investor?.first_name;
    const dealName = deal?.name || 'this deal';
    const content = name
      ? `Welcome back, ${name}! I'm here to help you explore ${dealName}.\n\nI can answer questions about the property, financial projections, Gray Capital's track record, tax benefits, the investment process \u2014 anything you want to know.\n\nWhat would you like to explore?`
      : `Welcome to the ${dealName} deal room! I'm here to help you explore this investment opportunity.\n\nI can answer questions about the property, financial projections, Gray Capital's track record, tax benefits, the investment process \u2014 anything you want to know.\n\nWhat would you like to explore?`;

    addChatMessage({
      id: 'welcome',
      role: 'assistant',
      content,
      created_at: new Date().toISOString(),
    });
  }, [investor, deal, chatMessages.length, addChatMessage]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setHasUserSentMessage(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    setIsLoading(true);

    // Chat history is now loaded server-side from Supabase — no client-provided history
    const sessionPayload = {
      investorName: investor?.first_name || undefined,
      investorEmail: investor?.email || undefined,
      investmentGoal: investor?.investment_goal || intakeAnswers?.investment_goal || undefined,
      syndicationExperience: investor?.syndication_experience || intakeAnswers?.syndication_experience || undefined,
      targetRange: investor?.target_range || intakeAnswers?.target_range || undefined,
      leadSource: investor?.lead_source || intakeAnswers?.lead_source || undefined,
      currentSection,
      sectionsVisited,
      timeOnSiteSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
      dealSlug: deal?.slug || 'parkview-commons',
      dealName: deal?.name || 'Parkview Commons',
      sessionId: session?.id || undefined,
    };

    const assistantMsgId = `assistant-${Date.now()}`;

    try {
      abortRef.current = new AbortController();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      };
      const token = localStorage.getItem('gc_session_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text.trim(),
          session: sessionPayload,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        let streamedText = '';
        let addedMsg = false;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'text') {
                streamedText += data.text;
                addChatMessage({
                  id: assistantMsgId,
                  role: 'assistant',
                  content: streamedText,
                  created_at: new Date().toISOString(),
                });
                addedMsg = true;
              } else if (data.type === 'done') {
                addChatMessage({
                  id: assistantMsgId,
                  role: 'assistant',
                  content: data.cleanText,
                  created_at: new Date().toISOString(),
                });
              } else if (data.type === 'navigate') {
                handleNavigation(data.data);
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        if (!addedMsg) {
          throw new Error('No response received');
        }
      } else {
        const data = await response.json();

        if (data.demo_mode) {
          setIsDemoMode(true);
        }

        addChatMessage({
          id: assistantMsgId,
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString(),
        });

        if (data.navigate) {
          handleNavigation(data.navigate);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      setIsDemoMode(true);
      const demoReply = getDemoResponse(text);
      addChatMessage({
        id: assistantMsgId,
        role: 'assistant',
        content: demoReply,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [
    isLoading, chatMessages, addChatMessage, investor, session, deal,
    currentSection, sectionsVisited, intakeAnswers, setCurrentSection,
  ]);

  function handleNavigation(navData: { section: string }) {
    const sectionMap: Record<string, string> = {
      property: 'property',
      market: 'market',
      financials: 'financials',
      business_plan: 'business-plan',
      business: 'business-plan',
      team: 'team',
      documents: 'documents',
    };
    const section = sectionMap[navData.section] || navData.section;
    if (section) {
      setCurrentSection(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return {
    messages: chatMessages,
    isLoading,
    isOpen: chatOpen,
    isDemoMode,
    hasUserSentMessage,
    setIsOpen: setChatOpen,
    sendMessage,
    showWelcome,
  };
}
