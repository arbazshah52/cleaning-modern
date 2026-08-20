import BookingFlow from '../components/BookingFlow';

export default function PrivateBooking() {
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
