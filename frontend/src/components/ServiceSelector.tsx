import { motion } from 'framer-motion';
import { ArrowRight, Clock, BadgePercent } from 'lucide-react';
import { Service } from '../data/services';

interface Props {
  services: Service[];
  selectedId?: string;
  onSelect: (s: Service) => void;
  title: string;
  subtitle: string;
}

export default function ServiceSelector({ services, selectedId, onSelect, title, subtitle }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-20" data-testid="service-selector">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-2xl"
      >
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky">Välj tjänst</p>
        <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">{title}</h2>
        <p className="mt-3 text-base text-muted">{subtitle}</p>
      </motion.div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {services.map((s, i) => {
          const active = s.id === selectedId;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              data-testid={`service-card-${s.id}`}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group rounded-4xl border bg-white p-8 text-left shadow-soft transition-colors duration-300 ${
                active ? 'border-mint ring-2 ring-mint/25' : 'border-line hover:border-sky/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-bold text-ink">{s.name}</h3>
                <span className="whitespace-nowrap rounded-full bg-sky-soft px-3 py-1.5 text-xs font-bold text-sky">
                  {s.pricePerHour} SEK/tim
                </span>
              </div>
              <p className="mt-3 text-sm text-muted">{s.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky" /> Från {s.minimumHours} timmar
                </span>
                <span className="flex items-center gap-1.5">
                  <BadgePercent className="h-3.5 w-3.5 text-mint" />
                  {s.rutEligible ? 'RUT-berättigad' : 'Faktura utan RUT'}
                </span>
                <span>{s.days}</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky">
                {active ? 'Valt' : 'Välj och boka'}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
