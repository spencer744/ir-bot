import { motion } from 'framer-motion';

interface MarketHeroProps {
  data: {
    msa_population: number;
    median_household_income: number;
    unemployment_rate: number;
    yoy_rent_growth: number;
    vacancy_rate: number;
  };
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function MarketHero({ data }: MarketHeroProps) {
  const stats = [
    { label: 'Population (MSA)', value: `${(data.msa_population / 1_000_000).toFixed(2)}M` },
    { label: 'Median HH Income', value: `$${(data.median_household_income / 1_000).toFixed(1)}K` },
    { label: 'Unemployment', value: `${data.unemployment_rate}%` },
    { label: 'YoY Rent Growth', value: `${data.yoy_rent_growth}%`, positive: true },
    { label: 'Vacancy Rate', value: `${data.vacancy_rate}%` },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      {stats.map(s => (
        <motion.div
          key={s.label}
          variants={item}
          className="bg-gc-surface border border-gc-border rounded-xl p-4 text-center"
        >
          <p className="text-[10px] text-gc-text-muted uppercase tracking-wider mb-1">{s.label}</p>
          <p className={`text-xl font-bold font-mono-numbers ${s.positive ? 'text-gc-positive' : 'text-gc-text'}`}>
            {s.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
