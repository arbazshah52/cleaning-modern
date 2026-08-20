import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, CalendarCheck } from 'lucide-react';
import Logo from './Logo';

const links = [
  { label: 'Hem', to: '/' },
  { label: 'Privat', to: '/privat' },
  { label: 'Företag', to: '/foretag' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header
      className="sticky top-0 z-50 border-b border-line/70 bg-white/80 backdrop-blur-xl"
      data-testid="navbar"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={`relative text-sm font-semibold transition-colors duration-200 hover:text-sky ${
                pathname === l.to ? 'text-sky' : 'text-ink'
              }`}
            >
              {l.label}
              {pathname === l.to && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-sky"
                />
              )}
            </Link>
          ))}
          <Link
            to="/privat"
            data-testid="nav-book-btn"
            className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-colors duration-200 hover:bg-mint-dark"
          >
            <CalendarCheck className="h-4 w-4" /> Boka städning
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-line p-2 md:hidden"
          data-testid="mobile-menu-btn"
          aria-label="Meny"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-hidden border-t border-line bg-white md:hidden"
            data-testid="mobile-menu"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-cream"
                  data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
