import { useCallback, useEffect, useRef } from 'react';
import { useDeal } from '../context/DealContext';
import { api } from '../lib/api';

interface TrackEventParams {
  eventType: string;
  eventData?: Record<string, any>;
  section?: string;
}

export function useAnalytics() {
  const {
    deal,
    investor,
    session,
    currentSection,
    sectionsVisited,
    chatMessages,
  } = useDeal();

  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const financialExplorerUsedRef = useRef(false);

  // Sync session start time from session data if available
  useEffect(() => {
    if (session?.started_at) {
      sessionStartRef.current = new Date(session.started_at).getTime();
    }
  }, [session?.started_at]);

  const trackEvent = useCallback(
    (params: TrackEventParams) => {
      if (!session?.id) return;

      api.trackEvent({
        event: params.eventType,
        section: params.section ?? currentSection,
        metadata: {
          ...params.eventData,
          investorId: investor?.id,
          dealSlug: deal?.slug,
        },
        session_id: session.id,
      }).catch(() => {});
    },
    [session?.id, investor?.id, deal?.slug, currentSection],
  );

  const trackSectionView = useCallback(
    (section: string) => {
      trackEvent({ eventType: 'section_view', section });
    },
    [trackEvent],
  );

  const trackDocumentDownload = useCallback(
    (docId: string, docTitle: string) => {
      trackEvent({
        eventType: 'document_download',
        eventData: { docId, docTitle },
      });
    },
    [trackEvent],
  );

  const trackChatMessage = useCallback(
    (message: string) => {
      trackEvent({
        eventType: 'chat_message',
        eventData: { message: message.slice(0, 200) },
      });
    },
    [trackEvent],
  );

  const trackScenarioChange = useCallback(
    (scenario: string) => {
      trackEvent({
        eventType: 'scenario_change',
        eventData: { scenario },
      });
    },
    [trackEvent],
  );

  const trackFinancialExplorerUsed = useCallback(() => {
    financialExplorerUsedRef.current = true;
    trackEvent({ eventType: 'financial_explorer_used' });
  }, [trackEvent]);

  const trackScheduleCallClicked = useCallback(() => {
    trackEvent({ eventType: 'schedule_call_clicked' });
  }, [trackEvent]);

  const trackPPMRequested = useCallback(() => {
    trackEvent({ eventType: 'ppm_requested' });
  }, [trackEvent]);

  const trackInterestIndicated = useCallback(
    (amountRange: string) => {
      trackEvent({
        eventType: 'interest_indicated',
        eventData: { amountRange },
      });
    },
    [trackEvent],
  );

  // Extended heartbeat
  useEffect(() => {
    if (!session?.id) return;

    const sendHeartbeat = () => {
      const totalSeconds = Math.floor(
        (Date.now() - sessionStartRef.current) / 1000,
      );

      const chatMessageCount = chatMessages.filter(
        (m) => m.role === 'user',
      ).length;

      const token = localStorage.getItem('gc_session_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: session.id,
          investorId: investor?.id,
          dealSlug: deal?.slug,
          currentSection,
          sectionsVisited,
          chatMessageCount,
          financialExplorerUsed: financialExplorerUsedRef.current,
          videoWatchedPct: session.video_watched_pct ?? 0,
          totalSeconds,
        }),
      }).catch(() => {});
    };

    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [
    session?.id,
    session?.video_watched_pct,
    investor?.id,
    deal?.slug,
    currentSection,
    sectionsVisited,
    chatMessages,
  ]);

  return {
    trackEvent,
    trackSectionView,
    trackDocumentDownload,
    trackChatMessage,
    trackScenarioChange,
    trackFinancialExplorerUsed,
    trackScheduleCallClicked,
    trackPPMRequested,
    trackInterestIndicated,
  };
}
