import BookingFlow from '../components/BookingFlow';
import { useSeo, serviceJsonLd, breadcrumbJsonLd } from '../lib/seo';

const JSONLD = [
  serviceJsonLd(
    'Kontorsstädning i Malmö',
    'Kontorsstädning, företagsstädning, regelbunden städning och specialstädning som bygg- och flyttstädning i Malmö med omnejd. Från 285 kr/tim eller fastpris på kvm och rum.',
    285,
    'Företag'
  ),
  breadcrumbJsonLd([
    { name: 'Hem', path: '/' },
    { name: 'Företag', path: '/foretag' },
  ]),
];

export default function BusinessBooking() {
  useSeo({
    title: 'Kontorsstädning & företagsstädning i Malmö | Modernstäd.se',
    description:
      'Städning för kontor, butik och lokal i Malmö, Lund och Trelleborg. Regelbunden städning eller specialstädning från 285 kr/tim, fast kontaktperson och tydlig faktura.',
    path: '/foretag',
    jsonLd: JSONLD,
  });

  return (
    <BookingFlow
      customerType="foretag"
      eyebrow="Företag"
      heading="Städning för din verksamhet"
      subheading="Kontor, butik eller lokal – regelbundet eller vid enstaka tillfällen, alltid med fast kontaktperson."
      image="/scene-foretag.jpg"
      selectorTitle="Vilken tjänst passar ert företag?"
      selectorSubtitle="Priser per timme exkl. moms. Företagstjänster omfattas inte av RUT-avdrag."
    />
  );
}
