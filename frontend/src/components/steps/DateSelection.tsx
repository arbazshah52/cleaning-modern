import { Field, StepHeader } from '../fields';

export default function DateSelection({ register, errors }: any) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div data-testid="step-date">
      <StepHeader index="05" title="Datum" subtitle="Välj när du vill att städningen ska starta. Ange gärna ett alternativt datum." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Önskat datum" error={errors.preferredDate?.message}>
          <input type="date" min={today} className="field" data-testid="input-preferredDate" {...register('preferredDate')} />
        </Field>
        <Field label="Alternativt datum (valfritt)" error={errors.alternativeDate?.message}>
          <input type="date" min={today} className="field" data-testid="input-alternativeDate" {...register('alternativeDate')} />
        </Field>
      </div>
    </div>
  );
}
