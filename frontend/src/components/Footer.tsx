import { Mail, Phone, MapPin, Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white" data-testid="footer">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 lg:px-10">
        <div>
          <p className="font-display text-lg font-extrabold text-ink">
            MODERNSTÄD<span className="text-sky">.SE</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Professionell städning i Malmö med omnejd. Tryggt, enkelt och skinande rent – vi sköter
            RUT-avdraget åt dig.
          </p>
        </div>
        <div className="text-sm text-muted">
          <p className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-ink">
            Områden
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-sky" />
            Malmö – Arlöv – Lund – Trelleborg – Staffanstorp – Bjärred
          </p>
        </div>
        <div className="text-sm text-muted">
          <p className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-ink">
            Kontakt
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-sky" /> arbazshah11@gmail.com
          </p>
          <p className="mt-2 flex items-center gap-2">
            <Phone className="h-4 w-4 text-sky" /> 0736200637
          </p>
          <p className="mt-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-sky" /> Org.nr 559391-4392
          </p>
        </div>
      </div>
      <div className="border-t border-line px-5 py-5 text-center text-xs text-muted lg:px-10">
        © {new Date().getFullYear()} Modernstäd.se – Org.nr 559391-4392 · arbazshah11@gmail.com ·
        0736200637 · Alla priser inkl. moms. Villkor och integritetspolicy gäller.
      </div>
    </footer>
  );
}
