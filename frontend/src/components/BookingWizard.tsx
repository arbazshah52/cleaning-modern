import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import ProgressBar from './ProgressBar';
import BookingSummary from './BookingSummary';
import PersonalDetails from './steps/PersonalDetails';
import AddressDetails from './steps/AddressDetails';
import RutSection from './steps/RutSection';
import CleaningDetails from './steps/CleaningDetails';
import DateSelection from './steps/DateSelection';
import TravelInvoice from './steps/TravelInvoice';
import OtherDetails from './steps/OtherDetails';
import { bookingSchema, stepFields } from '../lib/validation';
import { createBooking } from '../lib/api';
import { CustomerType, Service, serviceById } from '../data/services';
import { StepHeader } from './fields';

const STEP_LABELS = [
  'Uppgifter',
  'Adress',
  'RUT',
  'Städning',
  'Datum',
  'Resa & faktura',
  'Övrigt',
  'Bekräfta',
];

interface Props {
  customerType: CustomerType;
  services: Service[];
  initialServiceId: string;
  onDone: (booking: any) => void;
}

export default function BookingWizard({ customerType, services, initialServiceId, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const captcha = useMemo(() => {
    const a = 2 + Math.floor(Math.random() * 7);
    const b = 1 + Math.floor(Math.random() * 6);
    return { a, b, answer: a + b };
  }, []);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',
    defaultValues: {
      serviceId: initialServiceId,
      hours: String(serviceById(initialServiceId)?.minimumHours ?? 3),
      travelZoneId: 'central-malmo',
      rut: customerType === 'privat' ? 'ja' : 'nej',
      homeSize: '',
      frequency: '',
      startTime: '',
      invoiceOption: '',
      preferredDate: '',
      alternativeDate: '',
      floor: '',
      doorCode: '',
      message: '',
      contactPreference: '',
      captcha: '',
      termsAccepted: false,
    },
  });

  const values = watch();
  const service = serviceById(values.serviceId) ?? serviceById(initialServiceId);

  const next = async () => {
    const ok = await trigger(stepFields[step] as any);
    if (step === 6) {
      if (Number(values.captcha) !== captcha.answer) {
        setError('captcha', { message: 'Fel svar, försök igen' });
        return;
      }
    }
    if (!ok) return;
    if (service && step === 3 && Number(values.hours) < service.minimumHours) {
      setError('hours', { message: `Minst ${service.minimumHours} timmar för ${service.name}` });
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = handleSubmit(async (data) => {
    if (Number(data.captcha) !== captcha.answer) {
      setStep(6);
      setError('captcha', { message: 'Fel svar, försök igen' });
      return;
    }
    setSending(true);
    try {
      const booking = await createBooking({
        customerType,
        serviceId: data.serviceId,
        firstName: data.firstName,
        lastName: data.lastName,
        personalNumber: data.personalNumber,
        phone: data.phone,
        email: data.email,
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        floor: data.floor || '',
        doorCode: data.doorCode || '',
        rut: data.rut === 'ja',
        hours: Number(data.hours),
        homeSize: data.homeSize,
        frequency: data.frequency,
        startTime: data.startTime,
        preferredDate: data.preferredDate,
        alternativeDate: data.alternativeDate || '',
        travelZoneId: data.travelZoneId,
        invoiceOption: data.invoiceOption,
        message: data.message || '',
        contactPreference: data.contactPreference || '',
        termsAccepted: true,
      });
      toast.success('Bokningen är skickad!');
      onDone(booking);
    } catch (e: any) {
      toast.error(e.message || 'Något gick fel');
    } finally {
      setSending(false);
    }
  });

  const stepView = [
    <PersonalDetails key="p" register={register} errors={errors} />,
    <AddressDetails key="a" register={register} errors={errors} />,
    <RutSection
      key="r"
      watch={watch}
      setValue={setValue}
      errors={errors}
      rutEligible={service?.rutEligible}
    />,
    <CleaningDetails key="c" register={register} errors={errors} services={services} />,
    <DateSelection key="d" register={register} errors={errors} />,
    <TravelInvoice key="t" register={register} errors={errors} />,
    <OtherDetails
      key="o"
      register={register}
      errors={errors}
      captchaQuestion={`Hur mycket är ${captcha.a} + ${captcha.b}?`}
    />,
    <div key="s" data-testid="step-confirm">
      <StepHeader index="08" title="Bekräfta" subtitle="Kontrollera uppgifterna och skicka in din bokning." />
      <div className="space-y-2.5 rounded-3xl bg-cream p-6 text-sm">
        {[
          ['Namn', `${values.firstName || ''} ${values.lastName || ''}`],
          ['E-post', values.email],
          ['Mobil', values.phone],
          ['Adress', `${values.street || ''}, ${values.postalCode || ''} ${values.city || ''}`],
          ['Faktura', values.invoiceOption],
          ['Alternativt datum', values.alternativeDate || '–'],
          ['Meddelande', values.message || '–'],
        ].map(([k, v]) => (
          <div key={k as string} className="flex justify-between gap-4">
            <span className="text-muted">{k}</span>
            <span className="text-right font-semibold text-ink">{(v as string) || '–'}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 lg:hidden">
        <BookingSummary values={values} service={service} compact />
      </div>
    </div>,
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-10" data-testid="booking-wizard">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-4xl border border-line bg-white p-7 shadow-soft lg:p-10">
          <ProgressBar steps={STEP_LABELS} current={step} />
          <div className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {stepView[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-7">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              data-testid="wizard-back-btn"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-cream disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Tillbaka
            </button>

            {step < STEP_LABELS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                data-testid="wizard-next-btn"
                className="inline-flex items-center gap-2 rounded-full bg-sky px-7 py-3 text-sm font-semibold text-white shadow-lift transition-colors duration-200 hover:bg-sky-deep"
              >
                Nästa <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={sending}
                data-testid="wizard-submit-btn"
                className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3 text-sm font-semibold text-white shadow-lift transition-colors duration-200 hover:bg-mint-dark disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Skicka bokning
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <BookingSummary values={values} service={service} />
        </div>
      </div>
    </section>
  );
}
