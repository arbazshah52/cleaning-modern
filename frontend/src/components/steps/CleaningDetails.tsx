import { Field, StepHeader } from '../fields';
import { frequencies, homeSizes, hourOptions, startTimes } from '../../data/prices';
import { Service } from '../../data/services';

export default function CleaningDetails({ register, errors, services }: { register: any; errors: any; services: Service[] }) {
  return (
    <div data-testid="step-cleaning">
      <StepHeader index="04" title="Städning" subtitle="Berätta vad du behöver hjälp med och hur länge." />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Vilket erbjudande är du intresserad av?" error={errors.serviceId?.message}>
            <select className="field" data-testid="select-serviceId" {...register('serviceId')}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} – {s.pricePerHour} SEK/tim (från {s.minimumHours} tim)
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Antal timmar" error={errors.hours?.message}>
          <select className="field" data-testid="select-hours" {...register('hours')}>
            {hourOptions.map((h) => (
              <option key={h} value={h}>
                {h} timmar
              </option>
            ))}
          </select>
        </Field>
        <Field label="Bostadens storlek" error={errors.homeSize?.message}>
          <select className="field" data-testid="select-homeSize" {...register('homeSize')}>
            <option value="">Välj storlek</option>
            {homeSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Hur ofta?" error={errors.frequency?.message}>
          <select className="field" data-testid="select-frequency" {...register('frequency')}>
            <option value="">Välj intervall</option>
            {frequencies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Starttid" error={errors.startTime?.message}>
          <select className="field" data-testid="select-startTime" {...register('startTime')}>
            <option value="">Välj starttid</option>
            {startTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}
