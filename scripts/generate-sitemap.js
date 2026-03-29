import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogsJsonPath = path.join(__dirname, '../public/blogs/blogs.json');
const publicPath = path.join(__dirname, '../public');
const distPath = path.join(__dirname, '../dist');
const baseUrl = "https://mdaileylandscape.com";

const staticPages = [
    { url: '/', priority: '1.0' },
    { url: '/services', priority: '0.8' },
    { url: '/about', priority: '0.8' },
    { url: '/contact', priority: '0.8' },
    { url: '/blog', priority: '0.7' }
];

function generateSitemapEntries() {
    const today = new Date().toISOString().split('T')[0];
    let entries = '';

    // Add static pages
    staticPages.forEach(page => {
        entries += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <priority>${page.priority}</priority>
  </url>\n`;
    });

    // Add blog posts
    if (fs.existsSync(blogsJsonPath)) {
        const blogs = JSON.parse(fs.readFileSync(blogsJsonPath, 'utf8'));
        blogs.forEach(blog => {
            const date = blog.dateModified || blog.datePublished || blog.date || today;
            entries += `  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${date.split('T')[0]}</lastmod>
    <priority>0.6</priority>
  </url>\n`;
        });
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}</urlset>`;
}

function run() {
    const sitemapContent = generateSitemapEntries();

    // Save to public/
    fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemapContent);
    console.log('Generated: public/sitemap.xml');

    // Also save to dist/ if it exists (for current build)
    if (fs.existsSync(distPath)) {
        fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapContent);
        console.log('Generated: dist/sitemap.xml');
    }
}

run();
