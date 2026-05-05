import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const citiesPath = path.join(__dirname, '../public/cities/cities.json');
const distPath = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distPath, 'index.html');
const baseUrl = 'https://mdaileylandscape.com';
const publisher = 'M. Dailey Landscape & Design';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const SERVICES = [
  'Retaining Walls & Hardscape Patios',
  'Paver Driveway Installation',
  'Natural Stone & Boulder Features',
  'Custom Garden Arbors & Trellises',
  'Water Features & Pond Installation',
  'Artificial Turf & Synthetic Grass',
  'Sod & Mulch Installation',
  'Yard Drainage & Grading',
  'Spring & Fall Yard Cleanup'
];

function renderBody(city) {
  const services = SERVICES.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const highlights = city.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('');
  return `
    <article>
      <h1>${escapeHtml(city.headline)}</h1>
      <p><strong>Serving ${escapeHtml(city.shortName)}, IL.</strong> ${escapeHtml(city.intro)}</p>
      <h2>Why ${escapeHtml(city.shortName)} Homeowners Choose Us</h2>
      <p>We work across ${escapeHtml(city.neighborhoods)}.</p>
      <ul>${highlights}</ul>
      <h2>Landscaping Services Available in ${escapeHtml(city.shortName)}</h2>
      <ul>${services}</ul>
      <h2>Our ${escapeHtml(city.shortName)} Service Area</h2>
      <p>M. Dailey Landscape &amp; Design serves ${escapeHtml(city.shortName)}, IL and the surrounding Chicagoland suburbs. Call <a href="tel:+17735621366">(773) 562-1366</a> for a free on-site consultation.</p>
    </article>
  `;
}

function run() {
  if (!fs.existsSync(citiesPath)) {
    console.log('No cities.json found. Skipping city page generation.');
    return;
  }
  if (!fs.existsSync(indexHtmlPath)) {
    console.warn('dist/index.html not found. Run Vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const data = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const cities = data.cities || [];

  for (const city of cities) {
    const url = `${baseUrl}/landscaping-${city.slug}`;
    const title = `${city.headline} | ${publisher}`;
    const description = `${city.headline}. Paver driveways, retaining walls, patios, water features and full-yard design for ${city.shortName} homeowners. Free consultations.`;

    const localBusiness = {
      '@context': 'https://schema.org',
      '@type': 'LandscapingService',
      name: `${publisher} — ${city.shortName}`,
      image: `${baseUrl}/marcusbhai.png`,
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

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${baseUrl}/services` },
        { '@type': 'ListItem', position: 3, name: city.shortName, item: url }
      ]
    };

    let newHtml = baseHtml;

    if (newHtml.match(/<title>.*?<\/title>/)) {
      newHtml = newHtml.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
    }
    if (newHtml.match(/<meta\s+name="description"[^>]*>/)) {
      newHtml = newHtml.replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`);
    }
    if (newHtml.match(/<link\s+rel="canonical"[^>]*>/)) {
      newHtml = newHtml.replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
    }

    newHtml = newHtml
      .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="website" />`)
      .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
      .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);

    const schemaBlocks = [
      `<script type="application/ld+json">${JSON.stringify(localBusiness)}</script>`,
      `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`
    ].join('\n    ');

    newHtml = newHtml.replace('</head>', `${schemaBlocks}\n</head>`);

    const body = renderBody(city);
    if (newHtml.includes('<div id="root"></div>')) {
      newHtml = newHtml.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    } else {
      newHtml = newHtml.replace(/<div id="root"[^>]*><\/div>/, `<div id="root">${body}</div>`);
    }

    const outDir = path.join(distPath, `landscaping-${city.slug}`);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), newHtml);
    console.log(`Generated: dist/landscaping-${city.slug}/index.html`);
  }
}

run();
