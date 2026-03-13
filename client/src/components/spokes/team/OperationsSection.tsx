import { motion } from 'framer-motion';
import { Home, BarChart3, Hammer, Cpu } from 'lucide-react';

interface OperationsSectionProps {
  operations: {
    property_management?: { title: string; subtitle: string; body: string; learn_more?: string };
    asset_management?: { title: string; subtitle: string; body: string };
    construction?: { title: string; subtitle: string; body: string };
    tech_stack?: { title: string; subtitle: string; items: string[] };
  };
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Block({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={item}
      className="bg-gc-surface border border-gc-border rounded-xl p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gc-accent/10 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-gc-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gc-text">{title}</h3>
          <p className="text-xs text-gc-text-muted uppercase tracking-wider mb-2">{subtitle}</p>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function OperationsSection({ operations }: OperationsSectionProps) {
  if (!operations) return null;

  const { property_management, asset_management, construction, tech_stack } = operations;

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={container}
      className="space-y-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gc-text">Operations</h2>
        <p className="text-gc-text-secondary text-sm mt-1">
          Vertically integrated platform: property management, asset management, and construction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {property_management && (
          <Block
            icon={Home}
            title={property_management.title}
            subtitle={property_management.subtitle}
          >
            <p className="text-sm text-gc-text-secondary leading-relaxed mb-3">
              {property_management.body}
            </p>
            {property_management.learn_more && (
              <span className="text-sm text-gc-accent font-medium">{property_management.learn_more}</span>
            )}
          </Block>
        )}

        {asset_management && (
          <Block
            icon={BarChart3}
            title={asset_management.title}
            subtitle={asset_management.subtitle}
          >
            <p className="text-sm text-gc-text-secondary leading-relaxed">
              {asset_management.body}
            </p>
          </Block>
        )}

        {construction && (
          <Block
            icon={Hammer}
            title={construction.title}
            subtitle={construction.subtitle}
          >
            <p className="text-sm text-gc-text-secondary leading-relaxed">
              {construction.body}
            </p>
          </Block>
        )}

        {tech_stack && (
          <motion.div
            variants={item}
            className="md:col-span-2 bg-gc-surface border border-gc-border rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gc-accent/10 rounded-xl flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6 text-gc-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gc-text">{tech_stack.title}</h3>
                <p className="text-xs text-gc-text-muted uppercase tracking-wider mb-3">{tech_stack.subtitle}</p>
                <ul className="space-y-2">
                  {tech_stack.items?.map((line, i) => (
                    <li key={i} className="text-sm text-gc-text-secondary flex items-start gap-2">
                      <span className="text-gc-accent mt-0.5">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
