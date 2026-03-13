import { motion } from 'framer-motion';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface Testimonial {
  name: string;
  attribution: string;
  quote: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

/* -------------------------------------------------- */
/*  Framer variants                                    */
/* -------------------------------------------------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* -------------------------------------------------- */
/*  Main component                                     */
/* -------------------------------------------------- */

export default function Testimonials({ testimonials }: TestimonialsProps) {
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
          What Our Investors Say
        </h2>
      </motion.div>

      {/* Testimonial cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {testimonials.map((t) => (
          <motion.div
            key={`${t.name}-${t.attribution}`}
            variants={item}
            className="bg-gc-surface rounded-xl p-5 sm:p-8"
          >
            {/* Decorative opening quote */}
            <span
              className="block text-6xl font-serif leading-none select-none text-gc-accent/20"
              aria-hidden="true"
            >
              {'\u201C'}
            </span>

            {/* Quote text */}
            <p className="text-lg md:text-xl text-gc-text italic leading-relaxed mt-2">
              {t.quote}
            </p>

            {/* Attribution */}
            <p className="text-gc-text-secondary mt-4">
              &mdash; {t.name}, {t.attribution}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
