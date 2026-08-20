import { useState } from 'react';
import { motion } from 'framer-motion';
import ServiceSelector from '../components/ServiceSelector';
import BookingWizard from '../components/BookingWizard';
import Confirmation from '../components/Confirmation';
import { CustomerType, Service, servicesFor } from '../data/services';

interface Props {
  customerType: CustomerType;
  heading: string;
  subheading: string;
  eyebrow: string;
  image: string;
  selectorTitle: string;
  selectorSubtitle: string;
}

export default function BookingFlow({
  customerType,
  heading,
  subheading,
  eyebrow,
  image,
  selectorTitle,
  selectorSubtitle,
}: Props) {
  const list = servicesFor(customerType);
  const [service, setService] = useState<Service | null>(null);
  const [booking, setBooking] = useState<any>(null);

  if (booking) return <Confirmation booking={booking} />;

  return (
    <div data-testid={`booking-flow-${customerType}`}>
      <section className="grain relative overflow-hidden bg-sky-soft">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:px-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-sky">{eyebrow}</p>
            <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-5xl">{heading}</h1>
            <p className="mt-4 max-w-md text-base text-muted">{subheading}</p>
          </motion.div>
          <motion.img
            src={image}
            alt=""
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="ml-auto w-full max-w-md rounded-4xl shadow-lift"
          />
        </div>
      </section>

      {!service ? (
        <ServiceSelector
          services={list}
          onSelect={setService}
          title={selectorTitle}
          subtitle={selectorSubtitle}
        />
      ) : (
        <div className="pt-12">
          <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between gap-4 px-5 lg:px-10">
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Bokning – {service.name}
            </h2>
            <button
              type="button"
              onClick={() => setService(null)}
              data-testid="change-service-btn"
              className="text-sm font-semibold text-sky hover:text-sky-deep"
            >
              Byt tjänst
            </button>
          </div>
          <BookingWizard
            customerType={customerType}
            services={list}
            initialServiceId={service.id}
            onDone={setBooking}
          />
        </div>
      )}
    </div>
  );
}
