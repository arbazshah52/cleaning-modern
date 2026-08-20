import { Field, StepHeader } from '../fields';

export default function PersonalDetails({ register, errors }: any) {
  return (
    <div data-testid="step-personal">
      <StepHeader index="01" title="Dina uppgifter" subtitle="Vi behöver dina kontaktuppgifter för att kunna bekräfta bokningen." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Förnamn" error={errors.firstName?.message}>
          <input className="field" data-testid="input-firstName" placeholder="Anna" {...register('firstName')} />
        </Field>
        <Field label="Efternamn" error={errors.lastName?.message}>
          <input className="field" data-testid="input-lastName" placeholder="Andersson" {...register('lastName')} />
        </Field>
        <Field label="Personnummer" error={errors.personalNumber?.message} hint="Krävs för RUT-avdraget.">
          <input className="field" data-testid="input-personalNumber" placeholder="850101-1234" {...register('personalNumber')} />
        </Field>
        <Field label="Mobilnummer" error={errors.phone?.message}>
          <input className="field" data-testid="input-phone" placeholder="070 123 45 67" {...register('phone')} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="E-post" error={errors.email?.message}>
            <input className="field" data-testid="input-email" placeholder="anna@exempel.se" {...register('email')} />
          </Field>
        </div>
      </div>
    </div>
  );
}
