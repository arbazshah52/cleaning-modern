import BookingFlow from '../components/BookingFlow';

export default function BusinessBooking() {
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
