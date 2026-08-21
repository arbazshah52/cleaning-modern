import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { reviews, reviewStats } from '../data/reviews';

export function Stars({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} av 5 stjärnor`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-line'}`}
        />
      ))}
    </span>
  );
}

export default function Reviews() {
  const { average, total } = reviewStats();

  return (
    <section className="bg-white py-16 lg:py-24" data-testid="reviews-section">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-sky">Omdömen</p>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Vad kunderna i Malmö säger
            </h2>
            <p className="mt-3 text-base text-muted">
              Betyg och kommentarer från hem och företag i Malmö, Lund, Arlöv och Trelleborg.
            </p>
          </div>
          <div className="rounded-4xl bg-cream px-7 py-6" data-testid="reviews-average">
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl font-extrabold text-ink">
                {average.toLocaleString('sv-SE')}
              </span>
              <div>
                <Stars rating={average} />
                <p className="mt-1 text-xs text-muted">baserat på {total} omdömen</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.article
              key={r.id}
              data-testid={`review-card-${r.id}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: (i % 3) * 0.08 }}
              className="relative rounded-4xl border border-line bg-white p-7 shadow-soft"
            >
              <Quote className="absolute right-6 top-6 h-6 w-6 text-sky-soft" />
              <Stars rating={r.rating} />
              <p className="mt-4 text-sm text-muted">{r.text}</p>
              <div className="mt-6 border-t border-line pt-4">
                <p className="font-display text-sm font-bold text-ink">{r.name}</p>
                <p className="text-xs text-muted">
                  {r.service} · {r.city} ·{' '}
                  {new Date(r.date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted" data-testid="reviews-demo-note">
          Obs: omdömena ovan är exempeltexter för demo och ska bytas mot verifierade kundomdömen
          innan sajten går live.
        </p>
      </div>
    </section>
  );
}
