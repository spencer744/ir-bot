import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface CtaConfig {
  meetingsUrl: string;
  investmentPortalUrl: string;
  institutionalFormUrl: string;
  hubspotPortalId: string;
}

const DEFAULT_CONFIG: CtaConfig = {
  meetingsUrl: 'https://meetings.hubspot.com/gray-capital',
  investmentPortalUrl: 'https://investors.appfolioim.com/graycapitalllc',
  institutionalFormUrl: '',
  hubspotPortalId: '',
};

export function useConfig(): CtaConfig {
  const [config, setConfig] = useState<CtaConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    api.getConfig()
      .then((data) => setConfig({
        meetingsUrl: data.meetingsUrl || DEFAULT_CONFIG.meetingsUrl,
        investmentPortalUrl: data.investmentPortalUrl || DEFAULT_CONFIG.investmentPortalUrl,
        institutionalFormUrl: data.institutionalFormUrl || DEFAULT_CONFIG.institutionalFormUrl,
        hubspotPortalId: data.hubspotPortalId || DEFAULT_CONFIG.hubspotPortalId,
      }))
      .catch(() => {});
  }, []);

  return config;
}
