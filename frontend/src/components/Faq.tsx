import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { faqs } from '../data/faqs';

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-24" data-testid="faq-section">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-sky">Vanliga frågor</p>
          <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Frågor om städning, pris och RUT
          </h2>
          <p className="mt-4 max-w-sm text-base text-muted">
            Korta, tydliga svar om vad städning i Malmö kostar, hur RUT-avdraget fungerar och hur
            fastpriset räknas ut.
          </p>
        </div>

        <div className="divide-y divide-line rounded-4xl border border-line bg-white px-7 shadow-soft">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="py-5" data-testid={`faq-item-${i}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                  className="flex w-full items-center justify-between gap-5 text-left"
                  aria-expanded={isOpen}
                >
                  <h3 className="font-display text-base font-bold text-ink">{f.q}</h3>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-ink">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="overflow-hidden text-sm text-muted"
                      data-testid={`faq-answer-${i}`}
                    >
                      <span className="mt-3 block">{f.a}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
