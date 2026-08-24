import { Field, StepHeader } from '../fields';

export default function AddressDetails({ register, errors }: any) {
  return (
    <div data-testid="step-address">
      <StepHeader index="02" title="Din adress" subtitle="Var ska vi städa? Fyll i adressen så vi hittar rätt." />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Gatuadress" error={errors.street?.message}>
            <input className="field" data-testid="input-street" placeholder="Storgatan 12" {...register('street')} />
          </Field>
        </div>
        <Field label="Stad" error={errors.city?.message}>
          <input className="field" data-testid="input-city" placeholder="Malmö" {...register('city')} />
        </Field>
        <Field label="Postnummer" error={errors.postalCode?.message}>
          <input className="field" data-testid="input-postalCode" placeholder="211 34" {...register('postalCode')} />
        </Field>
        <Field label="Våning (valfritt)" error={errors.floor?.message}>
          <input className="field" data-testid="input-floor" placeholder="3 tr" {...register('floor')} />
        </Field>
        <Field label="Dörrkod (valfritt)" error={errors.doorCode?.message}>
          <input className="field" data-testid="input-doorCode" placeholder="1234" {...register('doorCode')} />
        </Field>
      </div>
    </div>
  );
}
