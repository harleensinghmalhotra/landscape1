import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { CheckCircle, Phone, ArrowRight } from 'lucide-react';

interface CityPageProps {
  onNavigate: (page: string, slug?: string) => void;
  citySlug: string;
}

interface City {
  slug: string;
  name: string;
  shortName: string;
  headline: string;
  intro: string;
  lat: number;
  lng: number;
  neighborhoods: string;
  highlights: string[];
}

const SITE_ORIGIN = 'https://mdaileylandscape.com';

const SERVICES = [
  { title: 'Retaining Walls & Hardscape Patios', slug: 'hardscapes' },
  { title: 'Paver Driveway Installation', slug: 'driveways' },
  { title: 'Natural Stone & Boulder Features', slug: 'stone-work' },
  { title: 'Custom Garden Arbors & Trellises', slug: 'structures' },
  { title: 'Water Features & Pond Installation', slug: 'water-features' },
  { title: 'Artificial Turf & Synthetic Grass', slug: 'turf' },
  { title: 'Sod & Mulch Installation', slug: 'sod-mulch' },
  { title: 'Yard Drainage & Grading', slug: 'drainage' },
  { title: 'Spring & Fall Yard Cleanup', slug: 'cleanup' }
];

export default function CityPage({ onNavigate, citySlug }: CityPageProps) {
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/cities/cities.json')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const match = (data.cities as City[]).find((c) => c.slug === citySlug) || null;
        setCity(match);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCity(null);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [citySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Service Area Not Found</h1>
          <p className="text-lg text-gray-600 mb-6">We don't have a dedicated page for that area yet.</p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold"
          >
            Contact Us For Service
          </button>
        </div>
      </div>
    );
  }

  const url = `${SITE_ORIGIN}/landscaping-${city.slug}`;
  const title = `${city.headline} | M. Dailey Landscape & Design`;

  const localBusinessJson = {
    '@context': 'https://schema.org',
    '@type': 'LandscapingService',
    name: `M. Dailey Landscape & Design — ${city.shortName}`,
    image: `${SITE_ORIGIN}/marcusbhai.png`,
    url,
    telephone: '+1-773-562-1366',
    email: 'marcus@mdaileylandscape.com',
    description: city.intro,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.shortName,
      addressRegion: 'IL',
      addressCountry: 'US'
    },
    geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
    areaServed: { '@type': 'City', name: city.shortName }
  };

  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${SITE_ORIGIN}/services` },
      { '@type': 'ListItem', position: 3, name: city.shortName, item: url }
    ]
  };

  return (
    <div className="bg-white">
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content={`${city.headline}. Paver driveways, retaining walls, patios, water features and full-yard design for ${city.shortName} homeowners. Free consultations.`}
        />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={city.intro} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${SITE_ORIGIN}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(localBusinessJson)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJson)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[550px] flex items-center bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/banner2.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-brand-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-4">
              Serving {city.shortName}, IL
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {city.headline}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mb-8">
              {city.intro}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('contact')}
                className="bg-brand-primary text-white px-7 py-4 rounded-lg font-semibold shadow-xl hover:bg-opacity-90 transition-all flex items-center gap-2"
              >
                Get a Free {city.shortName} Quote
                <ArrowRight size={18} />
              </button>
              <a
                href="tel:+17735621366"
                className="bg-white text-gray-900 px-7 py-4 rounded-lg font-semibold shadow-xl hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <Phone size={18} />
                (773) 562-1366
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Local highlights */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
            Why {city.shortName} Homeowners Choose Us
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
            We work across {city.neighborhoods}. Every property gets a proper site evaluation — soil, drainage, sun exposure, mature trees, setbacks — before a single shovel hits the ground.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {city.highlights.map((h, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <CheckCircle className="text-brand-primary mb-3" size={28} />
                <p className="text-base text-gray-800 leading-relaxed">{h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services in this city */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Landscaping Services Available in {city.shortName}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Every service we offer is available across {city.shortName} and the surrounding suburbs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <a
                key={s.slug}
                href="/services"
                onClick={(e) => { e.preventDefault(); onNavigate('services'); }}
                className="bg-white p-5 rounded-lg border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all flex items-start gap-3"
              >
                <CheckCircle className="text-brand-primary flex-shrink-0 mt-0.5" size={20} />
                <span className="text-sm sm:text-base font-medium text-gray-900">{s.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Our {city.shortName} Service Area
          </h2>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              title={`${city.shortName} service area map`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(city.shortName + ', IL')}&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your {city.shortName} Property?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Free, no-obligation on-site consultations. We'll walk your yard, talk through what you're picturing, and send a clear written quote within 48 hours.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-brand-primary text-white px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-semibold shadow-xl"
          >
            Request Your Free Quote
          </button>
        </div>
      </section>
    </div>
  );
}
