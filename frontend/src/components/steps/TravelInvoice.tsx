import { Field, StepHeader } from '../fields';
import { travelZones } from '../../data/travelZones';
import { invoiceOptions } from '../../data/prices';

export default function TravelInvoice({ register, errors }: any) {
  return (
    <div data-testid="step-travel">
      <StepHeader index="06" title="Resa & faktura" subtitle="Resekostnaden beror på var du bor och läggs till i sammanfattningen." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Resezon" error={errors.travelZoneId?.message}>
          <select className="field" data-testid="select-travelZoneId" {...register('travelZoneId')}>
            {travelZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} (+{z.fee} SEK)
              </option>
            ))}
          </select>
        </Field>
        <Field label="Faktureringsalternativ" error={errors.invoiceOption?.message}>
          <select className="field" data-testid="select-invoiceOption" {...register('invoiceOption')}>
            <option value="">Välj alternativ</option>
            {invoiceOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-6 rounded-2xl bg-sky-soft p-5 text-sm text-muted" data-testid="travel-zone-table">
        {travelZones.map((z) => (
          <div key={z.id} className="flex justify-between border-b border-white/70 py-1.5 last:border-0">
            <span>{z.name}</span>
            <span className="font-semibold text-ink">+{z.fee} SEK</span>
          </div>
        ))}
      </div>
    </div>
  );
}
