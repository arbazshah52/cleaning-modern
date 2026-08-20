import { Field, StepHeader } from '../fields';

export default function OtherDetails({ register, errors, captchaQuestion }: any) {
  return (
    <div data-testid="step-other">
      <StepHeader index="07" title="Övrigt" subtitle="Har du önskemål eller något vi bör känna till? Skriv gärna här." />
      <div className="grid gap-5">
        <Field label="Meddelande / önskemål" error={errors.message?.message}>
          <textarea rows={4} className="field" data-testid="input-message" placeholder="T.ex. husdjur, allergier, extra fokus på badrum..." {...register('message')} />
        </Field>
        <Field label="Vill du bli kontaktad en viss dag/tid? (valfritt)" error={errors.contactPreference?.message}>
          <input className="field" data-testid="input-contactPreference" placeholder="Vardagar efter 17:00" {...register('contactPreference')} />
        </Field>

        <Field label={`Kontrollfråga: ${captchaQuestion}`} error={errors.captcha?.message}>
          <input className="field" data-testid="input-captcha" placeholder="Ditt svar" {...register('captcha')} />
        </Field>

        <label className="flex items-start gap-3 rounded-2xl border border-line bg-white p-5">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded accent-mint" data-testid="checkbox-terms" {...register('termsAccepted')} />
          <span className="text-sm text-muted">
            Jag godkänner Modernstäd.se:s{' '}
            <span className="font-semibold text-ink">villkor</span> och att mina uppgifter behandlas
            enligt <span className="font-semibold text-ink">integritetspolicyn</span> för att hantera
            min bokning.
          </span>
        </label>
        {errors.termsAccepted && <span className="err" data-testid="error-terms">{errors.termsAccepted.message}</span>}
      </div>
    </div>
  );
}
