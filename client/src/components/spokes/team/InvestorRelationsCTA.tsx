import { motion } from 'framer-motion';
import { User } from 'lucide-react';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface Contact {
  name: string;
  title: string;
  email: string;
  photo_url: string | null;
}

interface ContactInfo {
  address: string;
  phone: string;
  website: string;
  meetings_url: string;
}

interface InvestorRelationsCTAProps {
  contacts: Contact[];
  contactInfo: ContactInfo;
  /** Override from app config (HubSpot meeting link) */
  meetingsUrl?: string;
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

export default function InvestorRelationsCTA({
  contacts,
  contactInfo,
  meetingsUrl: meetingsUrlProp,
}: InvestorRelationsCTAProps) {
  const meetingsUrl = meetingsUrlProp || contactInfo.meetings_url;
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
          Investor Relations
        </h2>
      </motion.div>

      {/* Contact cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {contacts.map((contact) => (
          <motion.div
            key={contact.email}
            variants={item}
            className="bg-gc-surface rounded-xl p-6 flex items-start gap-4"
          >
            {/* Photo / placeholder */}
            <div className="w-16 h-16 shrink-0 bg-gc-surface-elevated rounded-lg overflow-hidden flex items-center justify-center">
              {contact.photo_url ? (
                <img
                  src={contact.photo_url}
                  alt={contact.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gc-text-muted" />
              )}
            </div>

            {/* Info */}
            <div>
              <h3 className="font-bold text-gc-text">{contact.name}</h3>
              <p className="text-sm text-gc-text-secondary">{contact.title}</p>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm text-gc-accent hover:underline"
              >
                {contact.email}
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Schedule a Call button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-center"
      >
        <a
          href={meetingsUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gc-accent hover:bg-gc-accent-hover text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          Schedule a Call
        </a>

        {/* Company info line */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 text-xs text-[#8B8FA3] mt-4">
          <span>{contactInfo.address}</span>
          <span className="hidden sm:inline">&nbsp;|&nbsp;</span>
          <span>{contactInfo.phone}</span>
          <span className="hidden sm:inline">&nbsp;|&nbsp;</span>
          <span>{contactInfo.website}</span>
        </div>
      </motion.div>
    </section>
  );
}
