import { useParams, Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';

export default function LegalPage() {
  const { type } = useParams<{ type: string }>();
  const isTerms = type === 'terms';

  return (
    <div className="min-h-screen bg-gc-bg">
      <header className="border-b border-gc-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Logo variant="horizontal" theme="dark" />
          </Link>
          <nav className="flex gap-4 text-sm text-gc-text-secondary">
            <Link to="/legal/terms" className={isTerms ? 'text-gc-accent' : 'hover:text-gc-text transition-colors'}>
              Terms of Use
            </Link>
            <Link to="/legal/privacy" className={!isTerms ? 'text-gc-accent' : 'hover:text-gc-text transition-colors'}>
              Privacy Policy
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {isTerms ? <TermsOfUse /> : <PrivacyPolicy />}
      </main>

      <footer className="border-t border-gc-border px-6 py-6 text-center text-xs text-gc-text-muted">
        &copy; {new Date().getFullYear()} Gray Capital LLC. All rights reserved. &nbsp;|&nbsp;
        <Link to="/legal/terms" className="hover:text-gc-text transition-colors">Terms of Use</Link>
        &nbsp;|&nbsp;
        <Link to="/legal/privacy" className="hover:text-gc-text transition-colors">Privacy Policy</Link>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-gc-text mt-8 mb-3">{children}</h2>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gc-text-secondary text-sm leading-relaxed mb-4">{children}</p>
  );
}

function TermsOfUse() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gc-text mb-2">Terms of Use</h1>
      <p className="text-gc-text-muted text-sm mb-8">Effective Date: April 2026</p>

      <div className="bg-gc-surface border border-gc-border rounded-xl p-5 mb-8">
        <p className="text-gc-text-secondary text-sm leading-relaxed">
          <strong className="text-gc-text">Important:</strong> This deal room is a private investment platform operated by Gray Capital LLC.
          Access is limited to accredited investors as defined under SEC Regulation D, Rule 501. By accessing this platform,
          you confirm that you meet the accredited investor standards and agree to the terms below.
        </p>
      </div>

      <SectionTitle>1. Not an Offer to Sell Securities</SectionTitle>
      <Paragraph>
        Nothing on this platform constitutes an offer to sell, a solicitation of an offer to buy, or a recommendation of any
        security or investment product. Any such offer will be made only through a Private Placement Memorandum (PPM) and
        related subscription documents, and only to individuals or entities who qualify as accredited investors under applicable law.
      </Paragraph>

      <SectionTitle>2. Accredited Investor Requirement</SectionTitle>
      <Paragraph>
        This platform is intended exclusively for accredited investors as defined in Rule 501 of Regulation D under the Securities
        Act of 1933. By registering for access, you represent and warrant that you are an accredited investor and that you will
        not share access credentials or deal materials with anyone who does not qualify. Gray Capital LLC reserves the right to
        verify investor accreditation prior to accepting any subscription.
      </Paragraph>

      <SectionTitle>3. Forward-Looking Statements</SectionTitle>
      <Paragraph>
        This platform contains forward-looking statements, projections, and estimates. These are based on assumptions believed
        to be reasonable at the time of preparation, but actual results may differ materially. Past performance of Gray Capital LLC
        or any prior investment is not indicative of future results. All projected returns, IRR figures, equity multiples, cash-on-cash
        yields, and distributions are estimates only and are not guaranteed.
      </Paragraph>

      <SectionTitle>4. AI-Powered Advisory Tool</SectionTitle>
      <Paragraph>
        This platform includes an AI-powered conversation tool ("AI Advisor") intended to help investors understand deal materials.
        The AI Advisor is for informational purposes only. It does not provide legal, tax, or financial advice. Responses generated
        by the AI Advisor are not representations of Gray Capital LLC and should not be relied upon as the basis for any investment
        decision. Always consult your own legal, tax, and financial advisors.
      </Paragraph>

      <SectionTitle>5. Confidentiality</SectionTitle>
      <Paragraph>
        All materials, projections, financial data, and deal terms presented on this platform are confidential and proprietary to
        Gray Capital LLC. You agree not to reproduce, distribute, or disclose any such materials to third parties without the prior
        written consent of Gray Capital LLC.
      </Paragraph>

      <SectionTitle>6. No Warranty</SectionTitle>
      <Paragraph>
        This platform is provided "as is" without warranty of any kind. Gray Capital LLC does not warrant that the platform will
        be uninterrupted, error-free, or free from viruses or other harmful components. We reserve the right to modify, suspend,
        or discontinue access at any time without notice.
      </Paragraph>

      <SectionTitle>7. Limitation of Liability</SectionTitle>
      <Paragraph>
        To the maximum extent permitted by applicable law, Gray Capital LLC and its affiliates, officers, employees, and agents
        shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of
        this platform or any investment decision made in reliance on information provided herein.
      </Paragraph>

      <SectionTitle>8. Governing Law</SectionTitle>
      <Paragraph>
        These Terms of Use are governed by the laws of the State of Indiana, without regard to its conflict of law provisions.
        Any disputes arising under these Terms shall be resolved in the state or federal courts located in Marion County, Indiana.
      </Paragraph>

      <SectionTitle>9. Contact</SectionTitle>
      <Paragraph>
        For questions about these Terms of Use, please contact Gray Capital LLC at{' '}
        <a href="mailto:ir@graycapitalllc.com" className="text-gc-accent hover:underline">ir@graycapitalllc.com</a>.
      </Paragraph>
    </>
  );
}

function PrivacyPolicy() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gc-text mb-2">Privacy Policy</h1>
      <p className="text-gc-text-muted text-sm mb-8">Effective Date: April 2026</p>

      <div className="bg-gc-surface border border-gc-border rounded-xl p-5 mb-8">
        <p className="text-gc-text-secondary text-sm leading-relaxed">
          Gray Capital LLC ("Gray Capital," "we," "our," "us") respects your privacy. This Policy explains how we collect,
          use, and protect your personal information when you access our private investment platform.
        </p>
      </div>

      <SectionTitle>1. Information We Collect</SectionTitle>
      <Paragraph>
        When you register for access to our deal room, we collect the following information:
      </Paragraph>
      <ul className="list-disc list-inside text-gc-text-secondary text-sm mb-4 space-y-1 pl-2">
        <li>Full name and email address</li>
        <li>Phone number (optional)</li>
        <li>Self-certification of accredited investor status</li>
        <li>Investment preferences and experience (from onboarding questionnaire)</li>
        <li>Session activity: pages viewed, time on site, sections explored</li>
        <li>AI conversation transcripts</li>
        <li>Device and browser information (type, version, IP address)</li>
      </ul>

      <SectionTitle>2. How We Use Your Information</SectionTitle>
      <Paragraph>
        We use the information we collect to:
      </Paragraph>
      <ul className="list-disc list-inside text-gc-text-secondary text-sm mb-4 space-y-1 pl-2">
        <li>Provide access to deal room materials appropriate to your investor profile</li>
        <li>Personalize your experience and AI advisor interactions</li>
        <li>Contact you regarding investment opportunities you have indicated interest in</li>
        <li>Maintain records required for 506(b) private placement compliance</li>
        <li>Improve our platform and services</li>
        <li>Comply with applicable laws and regulatory requirements</li>
      </ul>

      <SectionTitle>3. Third-Party Services</SectionTitle>
      <Paragraph>
        We use the following third-party services to operate this platform:
      </Paragraph>
      <ul className="list-disc list-inside text-gc-text-secondary text-sm mb-4 space-y-1 pl-2">
        <li><strong className="text-gc-text">Supabase</strong> — Secure database and session management</li>
        <li><strong className="text-gc-text">HubSpot</strong> — CRM and investor relationship management</li>
        <li><strong className="text-gc-text">Anthropic (Claude)</strong> — AI-powered conversation processing</li>
        <li><strong className="text-gc-text">Sentry</strong> — Error monitoring (no personal data transmitted)</li>
      </ul>
      <Paragraph>
        Your data may be processed by these third parties solely to deliver the services described above. We do not sell
        your personal information to any third party.
      </Paragraph>

      <SectionTitle>4. Data Retention</SectionTitle>
      <Paragraph>
        We retain your registration data and session records for a period of seven (7) years following your last interaction
        with our platform, consistent with applicable securities regulations. AI conversation transcripts are retained for
        eighteen (18) months and may be deleted upon request.
      </Paragraph>

      <SectionTitle>5. Your Rights</SectionTitle>
      <Paragraph>
        Depending on your jurisdiction, you may have the right to:
      </Paragraph>
      <ul className="list-disc list-inside text-gc-text-secondary text-sm mb-4 space-y-1 pl-2">
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your personal information (subject to legal retention requirements)</li>
        <li>Opt out of marketing communications</li>
      </ul>
      <Paragraph>
        To exercise any of these rights, please contact us at{' '}
        <a href="mailto:ir@graycapitalllc.com" className="text-gc-accent hover:underline">ir@graycapitalllc.com</a>.
      </Paragraph>

      <SectionTitle>6. Security</SectionTitle>
      <Paragraph>
        We implement industry-standard security measures including encryption in transit (TLS), JWT-based session authentication,
        and access controls to protect your personal information. However, no method of transmission over the internet is
        100% secure, and we cannot guarantee absolute security.
      </Paragraph>

      <SectionTitle>7. 506(b) Compliance Disclosure</SectionTitle>
      <Paragraph>
        Gray Capital LLC operates this platform for private offerings made pursuant to Rule 506(b) of Regulation D under the
        Securities Act of 1933. Accordingly, we are required to maintain records of all persons who access this platform and
        all communications related to any offering. By registering, you consent to this recordkeeping.
      </Paragraph>

      <SectionTitle>8. Changes to This Policy</SectionTitle>
      <Paragraph>
        We may update this Privacy Policy from time to time. We will notify registered users of material changes by email.
        Continued use of the platform following notice of changes constitutes acceptance of the updated policy.
      </Paragraph>

      <SectionTitle>9. Contact</SectionTitle>
      <Paragraph>
        For privacy-related inquiries, contact Gray Capital LLC at{' '}
        <a href="mailto:ir@graycapitalllc.com" className="text-gc-accent hover:underline">ir@graycapitalllc.com</a>.
      </Paragraph>
    </>
  );
}
