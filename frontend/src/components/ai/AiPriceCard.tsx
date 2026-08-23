import { CheckCircle2, Loader2 } from 'lucide-react';
import { sek } from '../../data/prices';

export function AiPriceCard({
  price,
  ready,
  loading,
  onConfirm,
}: {
  price: any;
  ready: boolean;
  loading: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-2xl border border-mint/40 bg-mint-soft p-4 text-sm" data-testid="ai-price-card">
      <p className="font-display font-bold text-ink">
        Fastpris – {price.sqm} m², {price.rooms} rum
      </p>
      <div className="mt-2 space-y-1 text-xs text-muted">
        <Row label="Grundpris" value={sek(price.basePrice)} />
        {price.discountPct > 0 && (
          <Row label={`Rabatt (${price.discountPct} %)`} value={`−${sek(price.negotiationDiscount)}`} />
        )}
        {price.rutApplied && <Row label="RUT-avdrag" value={`−${sek(price.rutDiscount)}`} />}
        <Row label="Resekostnad" value={sek(price.travelFee)} />
      </div>
      <p className="mt-3 flex items-baseline justify-between font-display">
        <span className="text-sm font-bold text-ink">Att betala</span>
        <span className="text-xl font-extrabold text-mint-dark" data-testid="ai-price-total">
          {sek(price.total)}
        </span>
      </p>
      {ready && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          data-testid="ai-confirm-booking-btn"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-mint-dark disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Acceptera & boka
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

export function AiBookingConfirmed({ booking }: { booking: any }) {
  return (
    <div className="rounded-2xl border border-mint bg-white p-4 text-sm" data-testid="ai-booking-confirmed">
      <p className="flex items-center gap-2 font-display font-bold text-mint-dark">
        <CheckCircle2 className="h-4 w-4" /> Bokning bekräftad
      </p>
      <p className="mt-2 text-xs text-muted">
        Referens{' '}
        <strong className="text-ink" data-testid="ai-booking-reference">
          {booking.reference}
        </strong>{' '}
        · {sek(booking.price.total)} ·{' '}
        {booking.emailSent
          ? `bekräftelse skickad till ${booking.email}`
          : 'bekräftelse via e-post kunde inte skickas'}
      </p>
    </div>
  );
}
