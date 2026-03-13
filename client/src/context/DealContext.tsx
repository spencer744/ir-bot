import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Deal, DealMedia, SensitivityData } from '../types/deal';
import type { Investor, Session, ChatMessage, IntakeAnswers } from '../types/investor';
import { api } from '../lib/api';

interface DealContextValue {
  // Deal data
  deal: Deal | null;
  media: DealMedia[];
  sensitivityData: SensitivityData | null;
  loading: boolean;
  error: string | null;

  // Investor/session
  investor: Investor | null;
  session: Session | null;
  isAuthenticated: boolean;
  intakeAnswers: IntakeAnswers;
  intakeCompleted: boolean;
  sessionRestored: boolean;

  // Navigation
  currentSection: string;
  sectionsVisited: string[];
  setCurrentSection: (section: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;

  // Actions
  loadDeal: (slug: string) => Promise<void>;
  authenticate: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    deal_slug: string;
  }) => Promise<void>;
  completeIntake: (answers: IntakeAnswers) => void;
  trackEvent: (event: string, metadata?: Record<string, any>) => void;
}

const DealContext = createContext<DealContextValue | null>(null);

export function DealProvider({ children }: { children: ReactNode }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [media, setMedia] = useState<DealMedia[]>([]);
  const [sensitivityData, setSensitivityData] = useState<SensitivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [investor, setInvestor] = useState<Investor | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [intakeAnswers, setIntakeAnswers] = useState<IntakeAnswers>({});
  const [intakeCompleted, setIntakeCompleted] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);

  const [currentSection, setCurrentSectionState] = useState('hub');
  const [sectionsVisited, setSectionsVisited] = useState<string[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('gc_session_token');
    const sessionId = localStorage.getItem('gc_session_id');
    if (!token || !sessionId) {
      setSessionRestored(true);
      return;
    }

    api.verifySession()
      .then(res => {
        if (res.valid) {
          const inv = res.investor;
          setInvestor(inv ? {
            id: inv.id,
            hubspot_contact_id: inv.hubspot_contact_id ?? null,
            email: inv.email,
            first_name: inv.first_name,
            last_name: inv.last_name,
            phone: inv.phone || null,
            investment_goal: inv.investment_goal || null,
            syndication_experience: inv.syndication_experience || null,
            target_range: inv.target_range || null,
            lead_source: inv.lead_source || null,
          } : null);
          setSession({
            id: sessionId,
            investor_id: res.investor_id,
            deal_id: '',
            started_at: new Date().toISOString(),
            sections_visited: [],
            chat_message_count: 0,
            financial_explorer_used: false,
            video_watched_pct: 0,
            engagement_score: 0,
          });
          setIsAuthenticated(true);
          // If investor has intake data from DB, or localStorage flag is set, mark intake as completed
          if (inv?.investment_goal || inv?.syndication_experience || inv?.target_range || inv?.lead_source) {
            setIntakeAnswers({
              investment_goal: inv.investment_goal || undefined,
              syndication_experience: inv.syndication_experience || undefined,
              target_range: inv.target_range || undefined,
              lead_source: inv.lead_source || undefined,
            });
            setIntakeCompleted(true);
          } else if (localStorage.getItem('gc_intake_completed') === 'true') {
            setIntakeCompleted(true);
          }
        } else {
          localStorage.removeItem('gc_session_token');
          localStorage.removeItem('gc_session_id');
          localStorage.removeItem('gc_intake_completed');
        }
      })
      .catch(() => {
        localStorage.removeItem('gc_session_token');
        localStorage.removeItem('gc_session_id');
      })
      .finally(() => {
        setSessionRestored(true);
      });
  }, []);

  const setCurrentSection = (section: string) => {
    setCurrentSectionState(section);
    setSectionsVisited(prev => {
      if (prev.includes(section)) return prev;
      return [...prev, section];
    });
    if (session?.id) {
      api.trackEvent({
        event: 'section_view',
        section,
        session_id: session.id,
      }).catch(() => {});
    }
  };

  const loadDeal = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const [dealRes, mediaRes] = await Promise.all([
        api.getDeal(slug),
        api.getDealMedia(slug).catch(() => ({ media: [] })),
      ]);
      setDeal(dealRes.deal);
      setMedia(mediaRes.media);

      if (dealRes.deal.sensitivity_data) {
        setSensitivityData(dealRes.deal.sensitivity_data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load deal');
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    deal_slug: string;
  }) => {
    const res = await api.register(data);
    localStorage.setItem('gc_session_token', res.token);
    localStorage.setItem('gc_session_id', res.session_id);
    setInvestor({
      id: res.investor_id,
      hubspot_contact_id: res.hubspot_contact_id ?? null,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || null,
      investment_goal: null,
      syndication_experience: null,
      target_range: null,
      lead_source: null,
    });
    setSession({
      id: res.session_id,
      investor_id: res.investor_id,
      deal_id: '',
      started_at: new Date().toISOString(),
      sections_visited: [],
      chat_message_count: 0,
      financial_explorer_used: false,
      video_watched_pct: 0,
      engagement_score: 0,
    });
    setIsAuthenticated(true);
  };

  const completeIntake = (answers: IntakeAnswers) => {
    setIntakeAnswers(answers);
    setIntakeCompleted(true);
    localStorage.setItem('gc_intake_completed', 'true');
    if (session?.id) {
      api.submitIntake({ answers: answers as any, session_id: session.id }).catch(() => {});
    }
  };

  const addChatMessage = (msg: ChatMessage) => {
    setChatMessages(prev => {
      const idx = prev.findIndex(m => m.id === msg.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = msg;
        return updated;
      }
      return [...prev, msg];
    });
  };

  const trackEvent = (event: string, metadata?: Record<string, any>) => {
    if (!session?.id) return;
    api.trackEvent({
      event,
      section: currentSection,
      metadata,
      session_id: session.id,
    }).catch(() => {});
  };

  return (
    <DealContext.Provider
      value={{
        deal,
        media,
        sensitivityData,
        loading,
        error,
        investor,
        session,
        isAuthenticated,
        intakeAnswers,
        intakeCompleted,
        sessionRestored,
        currentSection,
        sectionsVisited,
        setCurrentSection,
        chatMessages,
        chatOpen,
        setChatOpen,
        addChatMessage,
        loadDeal,
        authenticate,
        completeIntake,
        trackEvent,
      }}
    >
      {children}
    </DealContext.Provider>
  );
}

export function useDeal() {
  const ctx = useContext(DealContext);
  if (!ctx) throw new Error('useDeal must be used within DealProvider');
  return ctx;
}
