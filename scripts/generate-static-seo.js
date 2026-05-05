import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogsJsonPath = path.join(__dirname, '../public/blogs/blogs.json');
const canonicalsPath = path.join(__dirname, '../public/blogs/canonicals.json');
const distPath = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distPath, 'index.html');
const publisherName = "M. Dailey Landscape & Design";
const baseUrl = "https://mdaileylandscape.com";

function escapeJsonString(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(str) {
  return String(str).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractFaqs(html) {
  if (!html) return [];
  const faqs = [];
  const headingRegex = /<h([23])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[23]\b|$)/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const headingText = stripHtml(match[2]);
    if (!headingText.endsWith('?')) continue;
    const answer = stripHtml(match[3]);
    if (!answer || answer.length < 30) continue;
    faqs.push({ q: headingText, a: answer });
  }
  return faqs;
}

async function run() {
  if (!fs.existsSync(blogsJsonPath)) {
    console.log('No blogs.json found. Skipping static generation.');
    return;
  }

  if (!fs.existsSync(indexHtmlPath)) {
    console.warn('dist/index.html not found. Please run Vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const blogs = JSON.parse(fs.readFileSync(blogsJsonPath, 'utf8'));

  let canonicals = {};
  if (fs.existsSync(canonicalsPath)) {
    const raw = JSON.parse(fs.readFileSync(canonicalsPath, 'utf8'));
    for (const [k, v] of Object.entries(raw)) {
      if (k.startsWith('_')) continue;
      canonicals[k] = v;
    }
  }

  const allSlugs = new Set();
  const blogsDir = path.join(__dirname, '../public/blogs');
  for (const file of fs.readdirSync(blogsDir)) {
    if (file.endsWith('.json') && file !== 'blogs.json' && file !== 'canonicals.json') {
      allSlugs.add(path.basename(file, '.json'));
    }
  }

  for (const slug of allSlugs) {
    const blogDetailPath = path.join(blogsDir, `${slug}.json`);
    if (!fs.existsSync(blogDetailPath)) continue;

    const blogDetail = JSON.parse(fs.readFileSync(blogDetailPath, 'utf8'));
    const detailSlug = blogDetail.slug || slug;
    const title = blogDetail.title || '';
    const description = blogDetail.description || blogDetail.intro || '';
    const datePublished = blogDetail.datePublished || blogDetail.date || '';
    const dateModified = blogDetail.dateModified || datePublished;
    const image = blogDetail.image || `${baseUrl}/og-image.jpg`;
    const content = blogDetail.content || '';

    const canonicalSlug = canonicals[detailSlug] || detailSlug;
    const canonicalUrl = `${baseUrl}/blog/${canonicalSlug}`;
    const isDuplicate = canonicalSlug !== detailSlug;

    const articleBodyText = stripHtml(content);
    const faqs = extractFaqs(content);

    let newHtml = baseHtml;

    // Update title
    if (newHtml.match(/<title>.*?<\/title>/)) {
      newHtml = newHtml.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)} | ${publisherName}</title>`);
    } else {
      newHtml = newHtml.replace('</head>', `  <title>${escapeHtml(title)} | ${publisherName}</title>\n</head>`);
    }

    // Replace meta description
    if (newHtml.match(/<meta\s+name="description"[^>]*>/)) {
      newHtml = newHtml.replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`);
    } else {
      newHtml = newHtml.replace('</head>', `  <meta name="description" content="${escapeHtml(description)}" />\n</head>`);
    }

    // Replace canonical (root index has one already; override per-blog)
    if (newHtml.match(/<link\s+rel="canonical"[^>]*>/)) {
      newHtml = newHtml.replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonicalUrl}" />`);
    } else {
      newHtml = newHtml.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
    }

    // Override OG/Twitter values on the root template (they were set for the homepage)
    newHtml = newHtml
      .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="article" />`)
      .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonicalUrl}" />`)
      .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
      .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);

    // Per-blog SEO additions
    const articleMeta = `
    <meta property="article:published_time" content="${datePublished}" />
    <meta property="article:modified_time" content="${dateModified}" />
    <meta property="article:author" content="${publisherName}" />
    `;

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/` },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${baseUrl}/blog` },
        { "@type": "ListItem", "position": 3, "name": title, "item": canonicalUrl }
      ]
    };

    const blogPosting = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": image,
      "articleBody": articleBodyText,
      "author": { "@type": "Organization", "name": publisherName, "url": baseUrl },
      "publisher": {
        "@type": "Organization",
        "name": publisherName,
        "logo": { "@type": "ImageObject", "url": `${baseUrl}/MAIN%20LOGO.png` }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
    };

    const schemaBlocks = [
      `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`,
      `<script type="application/ld+json">${JSON.stringify(blogPosting)}</script>`
    ];

    if (faqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      };
      schemaBlocks.push(`<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`);
    }

    if (isDuplicate) {
      // For duplicates, mark noindex so Google doesn't compete pages against each other
      newHtml = newHtml.replace(
        /<meta\s+name="robots"[^>]*>/,
        `<meta name="robots" content="noindex, follow" />`
      );
    }

    const extra = `
    ${articleMeta}
    ${schemaBlocks.join('\n    ')}
    `;
    newHtml = newHtml.replace('</head>', `${extra}\n</head>`);

    // Inject H1 + intro + content into the root mount so crawlers see real markup
    const renderedBody = `
      <article>
        <h1>${escapeHtml(title)}</h1>
        ${blogDetail.intro ? `<p><em>${escapeHtml(blogDetail.intro)}</em></p>` : ''}
        ${content}
      </article>
    `;

    if (newHtml.includes('<div id="root"></div>')) {
      newHtml = newHtml.replace('<div id="root"></div>', `<div id="root">${renderedBody}</div>`);
    } else {
      newHtml = newHtml.replace(/<div id="root"[^>]*><\/div>/, `<div id="root">${renderedBody}</div>`);
    }

    const outputDir = path.join(distPath, 'blog', detailSlug);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), newHtml);
    console.log(`Generated: dist/blog/${detailSlug}/index.html${isDuplicate ? `  → canonical: ${canonicalSlug}` : ''}`);
  }
}

run().catch(err => {
  console.error('Error generating static SEO files:', err);
  process.exit(1);
});
