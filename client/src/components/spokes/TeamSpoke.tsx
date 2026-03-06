import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAnalytics } from '../../hooks/useAnalytics';
import SpokeLayout from './SpokeLayout';
import TrackRecordHero from './team/TrackRecordHero';
import FullCycleTable from './team/FullCycleTable';
import ActivePortfolioTable from './team/ActivePortfolioTable';
import CaseStudies from './team/CaseStudies';
import CompanyOverview from './team/CompanyOverview';
import VerticalIntegration from './team/VerticalIntegration';
import InvestmentStrategies from './team/InvestmentStrategies';
import DealStructure from './team/DealStructure';
import AcquisitionCriteria from './team/AcquisitionCriteria';
import LeadershipGrid from './team/LeadershipGrid';
import Differentiators from './team/Differentiators';
import Testimonials from './team/Testimonials';
import InvestorRelationsCTA from './team/InvestorRelationsCTA';

const VI_NARRATIVE =
  'Gray Capital is built upon a fully integrated platform that allows control of every aspect of the real estate investment process — acquisitions, asset management, property management, construction management, and design. By keeping everything in-house, we streamline operations and create more value for our investors, delivering consistent returns while maintaining complete transparency and oversight at every stage.';

export default function TeamSpoke() {
  const { trackSectionView } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [fullCycle, setFullCycle] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.getTrackRecordSummary().catch(() => null),
      api.getTrackRecord().catch(() => ({ full_cycle: [], active_projects: [] })),
      api.getCaseStudies().catch(() => ({ case_studies: [] })),
      api.getTeamMembers().catch(() => ({ team_members: [] })),
      api.getTestimonials().catch(() => ({ testimonials: [] })),
      api.getCompanyData().catch(() => ({ company_data: null })),
    ]).then(([sum, tr, cs, tm, test, co]) => {
      setSummary(sum);
      setFullCycle(tr.full_cycle || []);
      setActiveProjects(tr.active_projects || []);
      setCaseStudies(cs.case_studies || []);
      setTeamMembers(tm.team_members || []);
      setTestimonials(test.testimonials || []);
      setCompanyData(co.company_data || null);
      setLoading(false);
    });
  }, []);

  useEffect(() => { trackSectionView('team'); }, []);

  if (loading) {
    return (
      <SpokeLayout title="Team & Track Record" subtitle="The people behind your investment">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gc-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </SpokeLayout>
    );
  }

  const leadership = teamMembers.filter((m: any) => m.display_section === 'leadership');
  const irContacts = teamMembers.filter((m: any) => m.display_section === 'ir');

  return (
    <SpokeLayout title="Team & Track Record" subtitle="The people behind your investment">
      <div className="space-y-14">
        {/* 1. Track Record Hero */}
        {summary && (
          <TrackRecordHero
            summary={summary}
            callouts={companyData?.highlight_callouts || []}
          />
        )}

        {/* 2. Full-Cycle Deals Table */}
        {fullCycle.length > 0 && <FullCycleTable deals={fullCycle} />}

        {/* 3. Active Portfolio Table */}
        {activeProjects.length > 0 && <ActivePortfolioTable projects={activeProjects} />}

        {/* 4. Case Studies */}
        {caseStudies.length > 0 && <CaseStudies studies={caseStudies} />}

        {/* 5. Company Overview */}
        {companyData?.overview_stats && (
          <CompanyOverview stats={companyData.overview_stats} />
        )}

        {/* 6. Vertically Integrated Platform */}
        {companyData?.vertical_integration && (
          <VerticalIntegration
            narrative={VI_NARRATIVE}
            pillars={companyData.vertical_integration}
          />
        )}

        {/* 7. Investment Strategies */}
        {companyData?.investment_strategies && (
          <InvestmentStrategies strategies={companyData.investment_strategies} />
        )}

        {/* 8. Deal Structure & Fees */}
        {companyData?.deal_structure && (
          <DealStructure structure={companyData.deal_structure} />
        )}

        {/* 9. Acquisition Criteria */}
        {companyData?.acquisition_criteria && (
          <AcquisitionCriteria criteria={companyData.acquisition_criteria} />
        )}

        {/* 10. Leadership */}
        {leadership.length > 0 && <LeadershipGrid members={leadership} />}

        {/* 11. Differentiators */}
        {companyData?.differentiators && (
          <Differentiators items={companyData.differentiators} />
        )}

        {/* 12. Testimonials */}
        {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}

        {/* 13. Investor Relations CTA */}
        {irContacts.length > 0 && companyData?.contact_info && (
          <InvestorRelationsCTA
            contacts={irContacts}
            contactInfo={companyData.contact_info}
          />
        )}

        {/* Footer Disclaimer */}
        <p className="text-gc-text-muted text-xs leading-relaxed">
          Past performance is not indicative of future results. All investments involve risk,
          including loss of principal. This material is for informational purposes only and
          does not constitute an offer to sell or a solicitation of an offer to buy any security.
        </p>
      </div>
    </SpokeLayout>
  );
}
