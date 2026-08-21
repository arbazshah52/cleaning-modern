import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, User, Briefcase } from 'lucide-react';
import Hero from '../components/Hero';
import Reviews from '../components/Reviews';
import Faq from '../components/Faq';
import { servicesFor } from '../data/services';
import { faqs } from '../data/faqs';
import { useSeo, faqJsonLd } from '../lib/seo';

const steps = [
  ['01', 'Välj tjänst', 'Privat eller företag – välj den städning som passar dig.'],
  ['02', 'Fyll i bokningen', 'Åtta korta steg med adress, timmar, datum och resezon.'],
  ['03', 'Vi bekräftar', 'Du får en bekräftelse på e-post och vi hörs innan första städningen.'],
];

const HOME_JSONLD = [faqJsonLd(faqs)];

export default function Home() {
  useSeo({
    title: 'Städning i Malmö – Hemstädning med RUT | Modernstäd.se',
    description:
      'Hemstädning och kontorsstädning i Malmö, Lund och Trelleborg från 226 kr/tim, eller fastpris på kvadratmeter och rum. Vi sköter RUT-avdraget – boka online på två minuter.',
    path: '/',
    jsonLd: HOME_JSONLD,
  });

  return (
    <div data-testid="home-page">
      <Hero />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-24" data-testid="services-preview">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-sky">Tjänster</p>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Städning för hem och företag
            </h2>
            <p className="mt-4 max-w-sm text-base text-muted">
              Data-drivna priser per timme, transparent resekostnad och RUT-avdrag direkt i
              bokningen.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/privat"
                data-testid="preview-privat-btn"
                className="inline-flex items-center gap-2 rounded-full bg-sky px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-sky-deep"
              >
                <User className="h-4 w-4" /> Privat
              </Link>
              <Link
                to="/foretag"
                data-testid="preview-foretag-btn"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-sky"
              >
                <Briefcase className="h-4 w-4" /> Företag
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[...servicesFor('privat').slice(0, 2), ...servicesFor('foretag').slice(0, 2)].map(
              (s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
                  className="rounded-4xl border border-line bg-white p-7 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-ink">{s.name}</h3>
                    <span className="whitespace-nowrap text-xs font-bold text-sky">
                      {s.pricePerHour} SEK/tim
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{s.description}</p>
                  <Link
                    to={s.customerType === 'privat' ? '/privat' : '/foretag'}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mint-dark"
                  >
                    Boka <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24" data-testid="how-it-works">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <h2 className="max-w-lg font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Så funkar det – från val till skinande rent
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map(([n, t, d], i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
                className="border-l-2 border-sky-soft pl-6"
              >
                <span className="font-display text-4xl font-extrabold text-sky-soft">{n}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">{t}</h3>
                <p className="mt-2 text-sm text-muted">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Reviews />
      <Faq />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10" data-testid="rut-section-home">        <div className="grain relative overflow-hidden rounded-4xl bg-sky-deep p-10 text-white lg:p-16">
          <div className="relative max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
              RUT-avdrag
            </p>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Halva arbetskostnaden – vi sköter pappersarbetet
            </h2>
            <p className="mt-4 text-base text-white/80">
              Som privatkund kan du dra av 50 % av arbetskostnaden. Du anger bara ditt personnummer
              i bokningen, sen tar vi hand om resten.
            </p>
            <Link
              to="/privat"
              data-testid="rut-cta-btn"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-mint-dark"
            >
              Boka med RUT <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sky/30 blur-2xl" />
        </div>
      </section>
    </div>
  );
}
