import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogsJsonPath = path.join(__dirname, '../public/blogs/blogs.json');
const distPath = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distPath, 'index.html');
const publisherName = "M Dailey Landscape";
const baseUrl = "https://mdaileylandscape.com";

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

  for (const blogSummary of blogs) {
    const blogDetailPath = path.join(__dirname, `../public/blogs/${blogSummary.slug}.json`);

    if (fs.existsSync(blogDetailPath)) {
      const blogDetail = JSON.parse(fs.readFileSync(blogDetailPath, 'utf8'));
      
      const slug = blogDetail.slug;
      const title = blogDetail.title;
      const description = blogDetail.description || blogDetail.intro || "";
      const canonicalUrl = `${baseUrl}/blog/${slug}`;
      const datePublished = blogDetail.datePublished || blogDetail.date;
      const dateModified = blogDetail.dateModified || datePublished;
      const image = blogDetail.image || `${baseUrl}/og-image.jpg`;
      const content = blogDetail.content || "";

      let newHtml = baseHtml;
      
      // Update Title
      if (newHtml.match(/<title>.*?<\/title>/)) {
        newHtml = newHtml.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      } else {
        newHtml = newHtml.replace('</head>', `  <title>${title}</title>\n</head>`);
      }
      
      // Update/Append Meta Description
      if (newHtml.match(/<meta\s+name="description"/)) {
          newHtml = newHtml.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}">`);
      } else {
          newHtml = newHtml.replace('</head>', `  <meta name="description" content="${description}">\n</head>`);
      }

      // Prepend extra SEO tags inside head
      const extraSeo = `
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="${publisherName}">
    <meta property="og:image" content="${image}">
    <meta property="article:published_time" content="${datePublished}">
    <meta property="article:modified_time" content="${dateModified}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">

    <!-- JSON-LD BlogPosting -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${title}",
      "description": "${description}",
      "image": "${image}",
      "author": {
        "@type": "Organization",
        "name": "${publisherName}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "${publisherName}",
        "logo": {
          "@type": "ImageObject",
          "url": "${baseUrl}/logo.png"
        }
      },
      "datePublished": "${datePublished}",
      "dateModified": "${dateModified}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${canonicalUrl}"
      }
    }
    </script>
    `;
      newHtml = newHtml.replace('</head>', `${extraSeo}\n</head>`);

      // Inject content directly to <div id="root">
      if (newHtml.includes('<div id="root"></div>')) {
        newHtml = newHtml.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
      } else {
        // Fallback or generic replacement if attributes exist
        newHtml = newHtml.replace(/<div id="root"[^>]*><\/div>/, `<div id="root">${content}</div>`);
      }
      
      const outputDir = path.join(distPath, 'blog', blogDetail.slug);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(path.join(outputDir, 'index.html'), newHtml);
      console.log(`Generated: dist/blog/${blogDetail.slug}/index.html`);
    } else {
      console.warn(`Warning: Detail file for slug "${blogSummary.slug}" not found at ${blogDetailPath}`);
    }
  }
}

run().catch(err => {
  console.error('Error generating static SEO files:', err);
  process.exit(1);
});
