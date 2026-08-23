import { motion } from 'framer-motion';
import { Service } from '../data/services';
import { zoneById } from '../data/travelZones';
import { calculateQuote, sek, Quote } from '../data/prices';

interface Props {
  values: any;
  service?: Service;
  compact?: boolean;
}

function Line({ label, value, tone = 'ink' }: { label: string; value: string; tone?: 'ink' | 'mint'; }) {
  return (
    <div className={`flex items-start justify-between gap-4 text-sm ${tone === 'mint' ? 'text-mint-dark' : ''}`}>
      <span className={tone === 'mint' ? '' : 'text-muted'}>{label}</span>
      <span className={`text-right font-semibold ${tone === 'mint' ? '' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

function PriceBreakdown({ quote, hours }: { quote: Quote; hours: number }) {
  return (
    <div className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
      <div className="flex justify-between">
        <span className="text-muted">
          Arbetskostnad ({quote.pricePerHour} SEK × {hours})
        </span>
        <span className="font-semibold text-ink" data-testid="summary-labour">
          {sek(quote.labourCost)}
        </span>
      </div>
      {quote.rutApplied && (
        <div className="flex justify-between text-mint-dark">
          <span>RUT-avdrag (50 %)</span>
          <span className="font-semibold" data-testid="summary-rut">
            −{sek(quote.rutDiscount)}
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted">Resekostnad</span>
        <span className="font-semibold text-ink" data-testid="summary-travel">
          {sek(quote.travelFee)}
        </span>
      </div>
    </div>
  );
}

export default function BookingSummary({ values, service, compact = false }: Props) {
  const hours = Number(values.hours) || 0;
  const zone = zoneById(values.travelZoneId);
  const rut = values.rut === 'ja';
  const quote = calculateQuote(values.serviceId || service?.id || '', hours, values.travelZoneId, rut);

  const rows: [string, string][] = [
    ['Tjänst', service?.name ?? '–'],
    ['Antal timmar', hours ? `${hours} timmar` : '–'],
    ['Bostadens storlek', values.homeSize || '–'],
    ['Hur ofta', values.frequency || '–'],
    ['Önskat datum', values.preferredDate || '–'],
    ['Starttid', values.startTime || '–'],
    ['Resezon', zone?.name ?? '–'],
    ['RUT', rut ? 'Ja' : 'Nej'],
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`rounded-4xl border border-line bg-white p-7 shadow-soft ${compact ? '' : 'lg:sticky lg:top-28'}`}
      data-testid="booking-summary"
    >
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-sky">Din bokning</p>
      <h4 className="font-display text-xl font-extrabold text-ink" data-testid="summary-service">
        {service?.name ?? 'Välj tjänst'}
      </h4>

      <div className="mt-6 space-y-2.5">
        {rows.map(([label, value]) => (
          <Line key={label} label={label} value={value} />
        ))}
      </div>

      <PriceBreakdown quote={quote} hours={hours} />

      <div className="mt-5 flex items-baseline justify-between rounded-2xl bg-mint-soft px-5 py-4">
        <span className="font-display text-sm font-bold text-ink">Beräknat pris</span>
        <span className="font-display text-2xl font-extrabold text-mint-dark" data-testid="summary-total">
          {sek(quote.total)}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted">
        Priset är preliminärt och bekräftas efter en genomgång av uppdraget.
      </p>
    </motion.aside>
  );
}
