import { useConfig } from '../../hooks/useConfig';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function StickyInvestCTA() {
  const { investmentPortalUrl, institutionalFormUrl, meetingsUrl } = useConfig();
  const { trackEvent, trackScheduleCallClicked } = useAnalytics();

  const showInstitutional = institutionalFormUrl && institutionalFormUrl.length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gc-surface/95 backdrop-blur border-t border-gc-border px-4 py-2.5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
      {investmentPortalUrl && (
        <a
          href={investmentPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gc-accent hover:text-gc-accent-hover font-medium"
        >
          Make a commitment
        </a>
      )}
      {meetingsUrl && (
        <a
          href={meetingsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackScheduleCallClicked}
          className="text-gc-text-secondary hover:text-gc-text"
        >
          Schedule a call
        </a>
      )}
      {showInstitutional && (
        <a
          href={institutionalFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent({ eventType: 'institutional_cta_clicked' })}
          className="text-gc-text-muted hover:text-gc-text-secondary text-xs"
        >
          Institutional investor or LP investing $2M+?
        </a>
      )}
    </div>
  );
}
