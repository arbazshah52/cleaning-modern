import { useEffect } from 'react';

const SITE = 'https://modernstad.se';

function setMeta(selector: string, attr: string, value: string, content: string) {
  let el = document.head.querySelector(`${selector}[${attr}="${value}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

interface Seo {
  title: string;
  description: string;
  path: string;
  jsonLd?: unknown[];
}

export function useSeo({ title, description, path, jsonLd = [] }: Seo) {
  useEffect(() => {
    const url = `${SITE}${path}`;
    document.title = title;
    setMeta('meta', 'name', 'description', description);
    setMeta('meta', 'property', 'og:title', title);
    setMeta('meta', 'property', 'og:description', description);
    setMeta('meta', 'property', 'og:url', url);
    setMeta('meta', 'name', 'twitter:title', title);
    setMeta('meta', 'name', 'twitter:description', description);
    setLink('canonical', url);

    const nodes = jsonLd.map((data) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.seo = 'page';
      s.text = JSON.stringify(data);
      document.head.appendChild(s);
      return s;
    });
    return () => nodes.forEach((n) => n.remove());
  }, [title, description, path, jsonLd]);
}

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const serviceJsonLd = (
  name: string,
  description: string,
  price: number,
  audience: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: name,
  name,
  description,
  provider: { '@type': 'LocalBusiness', name: 'Modernstäd.se', telephone: '+46736200637' },
  areaServed: ['Malmö', 'Arlöv', 'Lund', 'Staffanstorp', 'Bjärred', 'Trelleborg'],
  audience: { '@type': 'Audience', audienceType: audience },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'SEK',
    price,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price,
      priceCurrency: 'SEK',
      unitCode: 'HUR',
    },
  },
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${SITE}${it.path}`,
  })),
});
