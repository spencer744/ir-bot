import { motion } from 'framer-motion';
import { User } from 'lucide-react';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface Member {
  name: string;
  title: string;
  subtitle: string | null;
  entity: string;
  photo_url: string | null;
}

interface LeadershipGridProps {
  members: Member[];
}

/* -------------------------------------------------- */
/*  Entity badge styles                                */
/* -------------------------------------------------- */

function entityBadge(entity: string) {
  switch (entity) {
    case 'Gray Residential':
      return 'bg-emerald-500/20 text-emerald-400';
    case 'Gray Capital':
    case 'Gray Construction & Design':
    default:
      return 'bg-blue-500/20 text-blue-400';
  }
}

/* -------------------------------------------------- */
/*  Framer variants                                    */
/* -------------------------------------------------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* -------------------------------------------------- */
/*  Main component                                     */
/* -------------------------------------------------- */

export default function LeadershipGrid({ members }: LeadershipGridProps) {
  return (
    <section>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gc-text">
          Leadership
        </h2>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {members.map((member) => (
          <motion.div
            key={`${member.name}-${member.entity}`}
            variants={item}
            className="bg-gc-surface border border-gc-border rounded-xl p-5"
          >
            {/* Photo / placeholder */}
            <div className="aspect-square bg-gc-surface-elevated rounded-lg overflow-hidden flex items-center justify-center mb-4">
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gc-text-muted" />
              )}
            </div>

            {/* Name */}
            <h3 className="font-bold text-lg text-gc-text">{member.name}</h3>

            {/* Title */}
            <p className="text-sm text-gc-text-secondary">{member.title}</p>

            {/* Subtitle (optional) */}
            {member.subtitle && (
              <p className="text-xs text-gc-text-secondary italic">
                {member.subtitle}
              </p>
            )}

            {/* Entity badge */}
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full mt-2 ${entityBadge(member.entity)}`}
            >
              {member.entity}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
