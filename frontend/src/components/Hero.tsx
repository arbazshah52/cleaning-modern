import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Briefcase, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import TrustBar from './TrustBar';

const bubbles = [
  { size: 26, top: '14%', left: '52%', delay: 0 },
  { size: 14, top: '26%', left: '61%', delay: 1.4 },
  { size: 40, top: '8%', left: '73%', delay: 0.6 },
  { size: 18, top: '38%', left: '48%', delay: 2.1 },
  { size: 22, top: '58%', left: '92%', delay: 1.1 },
];

export default function Hero() {
  const { scrollY } = useScroll();
  const artY = useTransform(scrollY, [0, 500], [0, 70]);
  const blobY = useTransform(scrollY, [0, 500], [0, -50]);
  const textY = useTransform(scrollY, [0, 500], [0, 28]);

  return (
    <section
      className="grain relative overflow-hidden bg-sky-soft pb-16 pt-12 lg:pb-24 lg:pt-16"
      data-testid="hero-section"
    >
      <motion.div
        style={{ y: blobY }}
        className="pointer-events-none absolute -right-32 -top-40 h-[36rem] w-[36rem] rounded-full bg-white/70 blur-2xl"
      />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sky/10 blur-3xl" />

      {bubbles.map((b, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute hidden rounded-full border border-white/70 bg-white/40 lg:block"
          style={{ width: b.size, height: b.size, top: b.top, left: b.left }}
          animate={{ y: [0, -22, 0], opacity: [0.5, 0.95, 0.5] }}
          transition={{ duration: 9 + i, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        />
      ))}

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1fr_1.15fr] lg:px-10">
        <motion.div style={{ y: textY }} className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-sky shadow-soft"
          >
            <Sparkles className="h-3.5 w-3.5" /> Städfirma i Malmö sedan 2014
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
            className="text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl lg:text-6xl"
            data-testid="hero-headline"
          >
            Rent hem.
            <br />
            <span className="text-sky">Mer tid</span> för dig.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.18 }}
            className="mt-6 max-w-md text-base text-muted"
          >
            Professionell städning i Malmö med omnejd. Tryggt, enkelt och skinande rent – boka på
            två minuter.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.26 }}
            className="mt-5 flex items-start gap-2 text-sm text-muted"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
            Malmö – Arlöv – Lund – Trelleborg – Staffanstorp – Bjärred
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.34 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              to="/privat"
              data-testid="hero-privat-btn"
              className="group flex items-center gap-4 rounded-3xl bg-sky px-7 py-5 text-white shadow-lift transition-transform duration-300 hover:-translate-y-1"
            >
              <User className="h-6 w-6" />
              <span className="text-left">
                <span className="block font-display text-base font-bold">PRIVAT</span>
                <span className="text-xs text-white/80">Boka för ditt hem</span>
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              to="/foretag"
              data-testid="hero-foretag-btn"
              className="group flex items-center gap-4 rounded-3xl bg-white px-7 py-5 text-sky shadow-soft ring-1 ring-white transition-transform duration-300 hover:-translate-y-1"
            >
              <Briefcase className="h-6 w-6" />
              <span className="text-left">
                <span className="block font-display text-base font-bold">FÖRETAG</span>
                <span className="text-xs text-muted">Boka för ditt företag</span>
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.44 }}
            className="mt-8 flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-[11px] font-bold text-white">
              RUT
            </span>
            <span className="text-sm text-muted">
              <strong className="text-ink">Vi sköter RUT-avdraget åt dig.</strong> Enkelt, tryggt
              och smidigt.
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: artY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative"
        >
          <img
            src="/hero-cleaners.jpg"
            alt="Tecknade städare som städar ett skandinaviskt vardagsrum"
            className="w-full rounded-4xl object-cover shadow-lift"
            data-testid="hero-illustration"
          />
        </motion.div>
      </div>

      <TrustBar />
    </section>
  );
}
