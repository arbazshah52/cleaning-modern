import BookingFlow from '../components/BookingFlow';
import { useSeo, serviceJsonLd, breadcrumbJsonLd } from '../lib/seo';

const JSONLD = [
  serviceJsonLd(
    'Hemstädning i Malmö',
    'Regelbunden hemstädning, engångsstädning och återkommande städning i Malmö med omnejd. Från 226 kr/tim eller fastpris på kvm och rum, med 50 % RUT-avdrag.',
    226,
    'Privatpersoner'
  ),
  breadcrumbJsonLd([
    { name: 'Hem', path: '/' },
    { name: 'Privat', path: '/privat' },
  ]),
];

export default function PrivateBooking() {
  useSeo({
    title: 'Hemstädning Malmö med RUT-avdrag från 226 kr/tim | Modernstäd.se',
    description:
      'Boka hemstädning, engångsstädning eller återkommande städning i Malmö. Från 226 kr/tim eller fastpris på kvadratmeter och rum – 50 % RUT-avdrag direkt på fakturan.',
    path: '/privat',
    jsonLd: JSONLD,
  });

  return (
    <BookingFlow
      customerType="privat"
      eyebrow="Privat"
      heading="Städning för ditt hem"
      subheading="Välj tjänst, timmar och datum – vi sköter RUT-avdraget och skickar bekräftelse direkt."
      image="/scene-privat.jpg"
      selectorTitle="Vilken hjälp behöver du hemma?"
      selectorSubtitle="Alla priser är per timme inkl. moms, före RUT-avdrag."
    />
  );
}
