# Modernstäd.se – PRD

## Original problem statement
Animated Swedish cleaning-service booking website for Modernstäd.se: cartoon-illustrated animated
landing page ("Rent hem. Mer tid för dig."), Privat/Företag split, service selection, 8-step animated
booking wizard, data-driven pricing, travel-zone fees, RUT handling, booking summary, backend booking
logic, confirmation system.

## Stack
React 19 + Vite 5 + TypeScript + Tailwind + Framer Motion + React Hook Form + Zod (frontend, port 3000)
FastAPI + MongoDB (backend, /api prefix) + Emergent-managed Resend for confirmation email.

## User personas
- Privatkund i Malmöområdet som vill boka hemstädning med RUT-avdrag.
- Företagskund som behöver kontors-/lokalstädning, fakturaalternativ, ingen RUT.

## Core requirements (static)
- Swedish UI, mobile-first Scandinavian/cartoon visual identity.
- Data-driven services (name, pricePerHour, minimumHours, rutEligible, days, description).
- Travel zones: Centrala Malmö 0, Zon 1 49, Zon 2 99, Zon 3 149, Zon 4 199 SEK.
- 8-step wizard: Uppgifter, Adress, RUT, Städning, Datum, Resa & faktura, Övrigt (CAPTCHA + villkor), Bekräfta.
- Live price summary; 50 % RUT-avdrag on labour for eligible services.
- Bookings persisted; confirmation email to customer; reference MS-XXXXXX.

## Implemented (2026-06)
- Animated hero with parallax bubbles/blobs, original generated cartoon artwork, trust bar.
- Home page: service preview, "Så funkar det", RUT CTA, footer.
- /privat and /foretag flows: service selector -> wizard -> confirmation.
- Zod validation per step, math CAPTCHA, terms consent.
- Backend: GET /api/services, /api/travel-zones, POST /api/quote, POST /api/bookings,
  GET /api/bookings/{reference}; server-side price calculation and guardrailed Resend email.
- Full QA: backend 16/16 pytest, frontend privat + företag flows, mobile 390px – all pass.

## Backlog
- P1: Adminvy för bokningar, server-side regex för personnummer/postnummer/telefon.
- P1: Bokningsuppslag via referens i UI, notismail till Modernstäd.
- P2: Priser/tjänster i databasen med redigering, checklistor per tjänst, kalender med lediga tider.

## Implemented – AI-prisagent (2026-06)
- AI-agenten "Stella" (Claude Sonnet 4.6 / gpt-5.5 / Gemini 3.1 Pro via Emergent Universal Key,
  valbar i chatten) tar emot beställningar och förhandlar FASTPRIS på kvm + antal rum i stället för
  arbetstimmar. Max 10 % rabatt, alltid omräknat serverside.
- Fastprisregler: privat 25 kr/m² + 150 kr/rum (min 900), företag 30 kr/m² + 200 kr/rum (min 1500),
  plus resezonsavgift, RUT 50 % för privat.
- Chatten skapar bokningen direkt (POST /api/ai/bookings, source "ai-agent") med
  kundbekräftelse via e-post.
- Adminnotis till arbazshah11@gmail.com vid både formulärbokning och accepterad AI-offert.
- Företagsuppgifter i footern: arbazshah11@gmail.com, 0736200637, Org.nr 559391-4392.
- Nya endpoints: GET /api/company, POST /api/fixed-quote, POST /api/ai/chat, POST /api/ai/bookings.
- QA: 24/24 nya backendtester + 16/16 regression, hela AI-flödet i UI och mobil 390px – allt grönt.

## Implemented – Omdömen + SEO/AEO (2026-06)
- Omdömessektion på startsidan: 9 exempelomdömen med stjärnbetyg, snittbetyg (4,8) och tydlig
  demo-notis (ska bytas mot verifierade kundomdömen före lansering).
- FAQ-accordion med AEO-optimerade svar om pris, RUT, fastpris, områden och bokning.
- SEO: unik title/description/canonical/OG/Twitter per route via useSeo-hook, index.html med
  CleaningService- och WebSite-schema (org.nr, telefon, e-post, öppettider, tjänstekatalog),
  FAQPage på startsidan samt Service + BreadcrumbList på /privat och /foretag.
- AEO: robots.txt tillåter GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot m.fl. samt sitemap.xml.
- Medvetet val: ingen aggregateRating/Review i structured data så länge omdömena är demoinnehåll.
- QA: frontend 100 % (omdömen, FAQ, metadata per route, JSON-LD-städning vid navigering,
  robots/sitemap, regression av bokning och AI-agent, mobil 390px).
