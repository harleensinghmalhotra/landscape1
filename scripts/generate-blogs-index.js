import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogsDir = path.join(__dirname, '../public/blogs');
const indexPath = path.join(blogsDir, 'blogs.json');
const canonicalsPath = path.join(blogsDir, 'canonicals.json');

function extractIntro(post) {
  if (typeof post.intro === 'string' && post.intro.trim()) return post.intro.trim();
  if (typeof post.content === 'string') {
    const m = post.content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (m) {
      const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text) return text;
    }
  }
  if (typeof post.description === 'string' && post.description.trim()) return post.description.trim();
  return '';
}

function pickDate(post) {
  return post.date || post.datePublished || post.dateModified || '1970-01-01';
}

function loadCanonicals() {
  if (!fs.existsSync(canonicalsPath)) return {};
  const raw = JSON.parse(fs.readFileSync(canonicalsPath, 'utf8'));
  const map = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith('_')) continue;
    map[k] = v;
  }
  return map;
}

function run() {
  const canonicals = loadCanonicals();
  const files = fs.readdirSync(blogsDir).filter(
    (f) => f.endsWith('.json') && f !== 'blogs.json' && f !== 'canonicals.json'
  );

  const entries = [];
  let duplicateCount = 0;
  for (const file of files) {
    const full = path.join(blogsDir, file);
    let post;
    try {
      post = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (err) {
      console.warn(`Skipping ${file}: invalid JSON (${err.message})`);
      continue;
    }
    const slug = post.slug || path.basename(file, '.json');
    if (!post.title) {
      console.warn(`Skipping ${file}: missing title`);
      continue;
    }
    if (canonicals[slug] && canonicals[slug] !== slug) {
      duplicateCount++;
      continue;
    }
    entries.push({
      slug,
      title: post.title,
      date: pickDate(post),
      intro: extractIntro(post),
    });
  }

  entries.sort((a, b) => {
    const d = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (d !== 0) return d;
    return a.slug.localeCompare(b.slug);
  });

  const indexed = entries.map((e, i) => ({
    id: i + 1,
    slug: e.slug,
    title: e.title,
    date: e.date,
    intro: e.intro,
  }));

  fs.writeFileSync(indexPath, JSON.stringify(indexed, null, 2) + '\n');
  console.log(`Generated public/blogs/blogs.json with ${indexed.length} canonical posts (excluded ${duplicateCount} duplicates)`);
}

run();
