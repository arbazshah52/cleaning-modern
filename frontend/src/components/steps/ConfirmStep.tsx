import { Service } from '../../data/services';
import BookingSummary from '../BookingSummary';
import { StepHeader } from '../fields';

export default function ConfirmStep({ values, service }: { values: any; service?: Service }) {
  const rows: [string, string][] = [
    ['Namn', `${values.firstName || ''} ${values.lastName || ''}`.trim()],
    ['E-post', values.email],
    ['Mobil', values.phone],
    ['Adress', `${values.street || ''}, ${values.postalCode || ''} ${values.city || ''}`],
    ['Faktura', values.invoiceOption],
    ['Alternativt datum', values.alternativeDate],
    ['Meddelande', values.message],
  ];

  return (
    <div data-testid="step-confirm">
      <StepHeader index="08" title="Bekräfta" subtitle="Kontrollera uppgifterna och skicka in din bokning." />
      <div className="space-y-2.5 rounded-3xl bg-cream p-6 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="text-muted">{label}</span>
            <span className="text-right font-semibold text-ink">{value || '–'}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 lg:hidden">
        <BookingSummary values={values} service={service} compact />
      </div>
    </div>
  );
}
