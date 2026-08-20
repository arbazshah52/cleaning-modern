import { motion } from 'framer-motion';
import { ShieldCheck, Leaf, Star, Clock, Headphones } from 'lucide-react';

const items = [
  { icon: ShieldCheck, title: 'Trygg och pålitlig', sub: 'Kvalitet du kan lita på' },
  { icon: Leaf, title: 'Miljövänliga produkter', sub: 'Bra för dig och miljön' },
  { icon: Star, title: 'Nöjd kund-garanti', sub: 'Vi lämnar inte förrän du är nöjd' },
  { icon: Clock, title: 'Flexibla tider', sub: 'Vi anpassar oss efter dig' },
  { icon: Headphones, title: 'Personlig service', sub: 'Vi finns här för dig' },
];

export default function TrustBar() {
  return (
    <div className="relative mx-auto mt-14 max-w-7xl px-5 lg:px-10" data-testid="trust-bar">
      <div className="grid gap-6 rounded-4xl bg-white p-7 shadow-soft sm:grid-cols-2 lg:grid-cols-5 lg:p-9">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
            className="flex items-start gap-3"
          >
            <it.icon className="mt-0.5 h-5 w-5 shrink-0 text-sky" />
            <div>
              <p className="font-display text-sm font-bold text-ink">{it.title}</p>
              <p className="text-xs text-muted">{it.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
