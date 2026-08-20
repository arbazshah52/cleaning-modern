import { Link } from 'react-router-dom';

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" data-testid="logo-link">
      <img
        src="/logo-mark.jpg"
        alt="Modernstäd.se"
        className="h-10 w-10 rounded-xl object-cover mix-blend-multiply transition-transform duration-500 group-hover:rotate-[-6deg]"
      />
      <span className="leading-none">
        <span
          className={`block font-display text-xl font-extrabold tracking-tight ${
            light ? 'text-white' : 'text-ink'
          }`}
        >
          MODERNSTÄD<span className="text-sky">.SE</span>
        </span>
        <span className={`text-[11px] ${light ? 'text-white/70' : 'text-muted'}`}>
          Rent hem. Mer tid för dig.
        </span>
      </span>
    </Link>
  );
}
