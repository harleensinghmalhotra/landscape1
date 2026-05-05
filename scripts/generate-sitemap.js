import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogsJsonPath = path.join(__dirname, '../public/blogs/blogs.json');
const citiesJsonPath = path.join(__dirname, '../public/cities/cities.json');
const publicPath = path.join(__dirname, '../public');
const distPath = path.join(__dirname, '../dist');
const baseUrl = "https://mdaileylandscape.com";

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/services', priority: '0.9', changefreq: 'monthly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/gallery', priority: '0.7', changefreq: 'monthly' },
  { url: '/careers', priority: '0.5', changefreq: 'monthly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' }
];

function generateSitemapEntries() {
  const today = new Date().toISOString().split('T')[0];
  const entries = [];

  for (const page of staticPages) {
    entries.push(`  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // City landing pages
  if (fs.existsSync(citiesJsonPath)) {
    const cityData = JSON.parse(fs.readFileSync(citiesJsonPath, 'utf8'));
    const cities = cityData.cities || [];
    for (const city of cities) {
      entries.push(`  <url>
    <loc>${baseUrl}/landscaping-${city.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>`);
    }
  }

  // blogs.json is already filtered to canonical-only by generate-blogs-index.js
  if (fs.existsSync(blogsJsonPath)) {
    const blogs = JSON.parse(fs.readFileSync(blogsJsonPath, 'utf8'));
    for (const blog of blogs) {
      const date = (blog.dateModified || blog.datePublished || blog.date || today).split('T')[0];
      entries.push(`  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

function run() {
  const sitemapContent = generateSitemapEntries();

  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemapContent);
  console.log('Generated: public/sitemap.xml');

  if (fs.existsSync(distPath)) {
    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapContent);
    console.log('Generated: dist/sitemap.xml');
  }
}

run();
