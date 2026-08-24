import { ExternalLink } from 'lucide-react';
import { StepHeader, OptionCards } from '../fields';

export default function RutSection({ watch, setValue, errors, rutEligible }: any) {
  const value = watch('rut');
  return (
    <div data-testid="step-rut">
      <StepHeader
        index="03"
        title="RUT-avdrag"
        subtitle={
          rutEligible
            ? 'Med RUT-avdrag betalar du halva arbetskostnaden – vi sköter administrationen.'
            : 'Företagstjänster omfattas inte av RUT-avdrag, men kostnaden är normalt avdragsgill.'
        }
      />
      <OptionCards
        testid="rut-option"
        value={value}
        onChange={(v) => setValue('rut', v, { shouldValidate: true })}
        options={[
          { value: 'ja', label: 'Ja', sub: 'Jag är berättigad till RUT-avdrag' },
          { value: 'nej', label: 'Nej', sub: 'Fakturera hela beloppet' },
        ]}
      />
      {errors.rut && <span className="err" data-testid="error-rut">{errors.rut.message}</span>}
      <a
        href="https://www.skatteverket.se/privat/fastigheterochbostad/rotochrutarbete.4.html"
        target="_blank"
        rel="noreferrer"
        data-testid="rut-info-link"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky hover:text-sky-deep"
      >
        Läs mer om RUT-avdraget <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
