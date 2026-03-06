export default function Disclaimer() {
  return (
    <footer className="border-t border-gc-border bg-gc-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-gc-text-muted text-[10px] leading-relaxed text-center">
          This material is for informational purposes only and does not constitute an offer to sell
          or a solicitation of an offer to buy any security. Offers are made only through a Private
          Placement Memorandum (PPM) to accredited investors. Past performance is not indicative of
          future results. All projections are forward-looking estimates and subject to change.
          Consult your financial, tax, and legal advisors before investing.
        </p>
        <p className="text-gc-text-muted text-[10px] text-center mt-3">
          &copy; {new Date().getFullYear()} Gray Capital. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
