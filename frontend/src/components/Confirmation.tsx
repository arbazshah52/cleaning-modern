import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import { sek } from '../data/prices';

export default function Confirmation({ booking }: { booking: any }) {
  const p = booking.price;
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 lg:px-10 lg:py-24" data-testid="confirmation">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="rounded-4xl border border-line bg-white p-9 shadow-soft lg:p-12"
      >
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-mint-soft"
        >
          <CheckCircle2 className="h-7 w-7 text-mint-dark" />
        </motion.span>

        <h2 className="mt-6 font-display text-3xl font-extrabold text-ink sm:text-4xl">
          Tack {booking.firstName}! Din bokning är mottagen.
        </h2>
        <p className="mt-3 text-base text-muted">
          Referens{' '}
          <strong className="text-ink" data-testid="confirmation-reference">
            {booking.reference}
          </strong>
          . Vi kontaktar dig inom kort för att bekräfta tid och detaljer.
        </p>

        <div className="mt-8 space-y-2.5 rounded-3xl bg-cream p-6 text-sm">
          {[
            ['Tjänst', booking.serviceName],
            ['Antal timmar', `${booking.hours} timmar`],
            ['Hur ofta', booking.frequency],
            ['Önskat datum', booking.preferredDate],
            ['Starttid', booking.startTime],
            ['Adress', `${booking.street}, ${booking.postalCode} ${booking.city}`],
            ['Resezon', booking.travelZoneName],
            ['RUT', p.rutApplied ? 'Ja' : 'Nej'],
            ['Resekostnad', sek(p.travelFee)],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between gap-4">
              <span className="text-muted">{k}</span>
              <span className="text-right font-semibold text-ink">{v}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-line pt-3">
            <span className="font-display font-bold text-ink">Beräknat pris</span>
            <span className="font-display font-extrabold text-mint-dark">{sek(p.total)}</span>
          </div>
        </div>

        <p className="mt-6 flex items-center gap-2 text-sm text-muted" data-testid="confirmation-email-status">
          <Mail className="h-4 w-4 text-sky" />
          {booking.emailSent
            ? `En bekräftelse har skickats till ${booking.email}.`
            : 'Vi kunde inte skicka bekräftelsen via e-post just nu, men din bokning är registrerad.'}
        </p>

        <Link
          to="/"
          data-testid="confirmation-home-btn"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-sky-deep"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka till startsidan
        </Link>
      </motion.div>
    </section>
  );
}
