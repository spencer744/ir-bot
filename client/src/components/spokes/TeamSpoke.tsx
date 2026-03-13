import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useConfig } from '../../hooks/useConfig';
import SpokeLayout from './SpokeLayout';
import { SkeletonBlock, SkeletonCard } from '../shared/Skeleton';
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
import OperationsSection from './team/OperationsSection';

const VI_NARRATIVE =
  'Gray Capital is built upon a fully integrated platform that allows control of every aspect of the real estate investment process — acquisitions, asset management, property management, construction management, and design. By keeping everything in-house, we streamline operations and create more value for our investors, delivering consistent returns while maintaining complete transparency and oversight at every stage.';

export default function TeamSpoke() {
  const { trackSectionView } = useAnalytics();
  const { meetingsUrl } = useConfig();
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
        <div className="space-y-10 sm:space-y-14">
          {/* Track record hero skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gc-surface border border-gc-border rounded-2xl p-5 space-y-3">
                <SkeletonBlock className="h-4 w-1/2" />
                <SkeletonBlock className="h-8 w-3/4" />
              </div>
            ))}
          </div>
          {/* Table skeleton */}
          <div className="bg-gc-surface border border-gc-border rounded-2xl p-5 space-y-3">
            <SkeletonBlock className="h-5 w-1/4 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10 w-full" />
            ))}
          </div>
          {/* Leadership grid skeleton */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          {/* Additional section */}
          <SkeletonCard />
        </div>
      </SpokeLayout>
    );
  }

  const leadership = teamMembers.filter((m: any) => m.display_section === 'leadership');
  const irContacts = teamMembers.filter((m: any) => m.display_section === 'ir');

  return (
    <SpokeLayout title="Team & Track Record" subtitle="The people behind your investment">
      <div className="space-y-10 sm:space-y-14">
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

        {/* 6b. Operations — Gray Residential, Asset Mgmt, Gray Construction, Tech Stack */}
        {companyData?.operations && (
          <OperationsSection operations={companyData.operations} />
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
            meetingsUrl={meetingsUrl}
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
