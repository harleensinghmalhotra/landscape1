import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';

interface BlogPostPageProps {
  onNavigate: (page: string, slug?: string) => void;
  slug: string;
}

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  date: string;
  intro: string;
  content: string;
  // Tolerate the alternate schema some posts use
  description?: string;
  datePublished?: string;
}

function normalizePost(p: any): BlogPost {
  return {
    ...p,
    intro: p.intro || p.description || '',
    date: p.date || p.datePublished || '',
  };
}

const SITE_ORIGIN = 'https://mdaileylandscape.com';
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','of','to','in','on','for','with','at','by','from','is','are','was','were','be','been','being','it','this','that','these','those','your','our','my','their','his','her','its','as','if','than','then','so','do','does','did','can','will','should','would','could','have','has','had','i','you','we','they','he','she','what','which','who','how','why','when','where','about','into','out','up','down','over','under','more','most','some','any','no','not'
]);

const LINK_RULES: { pattern: RegExp; href: string }[] = [
  { pattern: /\bretaining walls?\b/gi, href: '/services' },
  { pattern: /\bpaver driveways?\b/gi, href: '/services' },
  { pattern: /\bpaver patios?\b/gi, href: '/services' },
  { pattern: /\bpaver walkways?\b/gi, href: '/services' },
  { pattern: /\bartificial turf\b/gi, href: '/services' },
  { pattern: /\bsod installation\b/gi, href: '/services' },
  { pattern: /\bwater features?\b/gi, href: '/services' },
  { pattern: /\bpondless waterfalls?\b/gi, href: '/services' },
  { pattern: /\bkoi ponds?\b/gi, href: '/services' },
  { pattern: /\bfree consultation\b/gi, href: '/contact' },
  { pattern: /\bfree quote\b/gi, href: '/contact' }
];

function linkifyContent(html: string): string {
  if (!html) return html;
  return html.replace(/(<p[^>]*>)([\s\S]*?)(<\/p>)/gi, (_match, open, body, close) => {
    if (/<a\b/i.test(body)) return open + body + close;
    let linkedBody = body;
    let appliedAny = false;
    for (const rule of LINK_RULES) {
      if (appliedAny) break;
      const replaced = linkedBody.replace(rule.pattern, (m: string) => {
        appliedAny = true;
        return `<a href="${rule.href}" data-internal="1">${m}</a>`;
      });
      linkedBody = replaced;
    }
    return open + linkedBody + close;
  });
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
  );
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return inter / union;
}

export default function BlogPostPage({ onNavigate, slug }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [canonicals, setCanonicals] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [listRes, canonRes, postRes] = await Promise.all([
          fetch('/blogs/blogs.json'),
          fetch('/blogs/canonicals.json').catch(() => null),
          fetch(`/blogs/${slug}.json`),
        ]);

        const rawList = await listRes.json();
        const listData: BlogPost[] = rawList.map(normalizePost);
        setAllPosts(listData);

        let canonMap: Record<string, string> = {};
        if (canonRes && canonRes.ok) {
          const raw = await canonRes.json();
          canonMap = Object.fromEntries(
            Object.entries(raw).filter(([k]) => !k.startsWith('_')) as [string, string][]
          );
          setCanonicals(canonMap);
        }

        if (canonMap[slug] && canonMap[slug] !== slug) {
          onNavigate('blog-post', canonMap[slug]);
          return;
        }

        const rawPost = await postRes.json();
        const postData: BlogPost = normalizePost(rawPost);
        setPost(postData);

        const target = tokenize(`${postData.title} ${postData.intro}`);
        const scored = listData
          .filter((p) => p.slug !== slug)
          .map((p) => ({
            post: p,
            score: similarity(target, tokenize(`${p.title} ${p.intro}`)),
          }))
          .sort((a, b) => b.score - a.score);

        const top = scored.slice(0, 3).map((s) => s.post);
        const fallback = top.length < 3
          ? [...top, ...listData.filter((p) => p.slug !== slug && !top.includes(p)).slice(0, 3 - top.length)]
          : top;
        setRelatedPosts(fallback);
      } catch (e) {
        setPost(null);
      }

      setLoading(false);
    };

    setLoading(true);
    load();
  }, [slug, onNavigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPrevNextPosts = () => {
    if (!post || !allPosts.length) return { prev: null, next: null };
    const idx = allPosts.findIndex((p) => p.slug === post.slug);
    return {
      prev: idx > 0 ? allPosts[idx - 1] : null,
      next: idx < allPosts.length - 1 ? allPosts[idx + 1] : null,
    };
  };

  const { prev, next } = getPrevNextPosts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading blog post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-lg text-gray-600 mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <button
            onClick={() => onNavigate('blog')}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const canonicalSlug = canonicals[post.slug] || post.slug;
  const canonicalUrl = `${SITE_ORIGIN}/blog/${canonicalSlug}`;
  const isDuplicate = canonicalSlug !== post.slug;
  const ogImage = `${SITE_ORIGIN}/og-image.jpg`;

  return (
    <div className="bg-white">
      <Helmet>
        <title>{post.title} | M. Dailey Landscape & Design</title>
        <meta name="description" content={post.intro} />
        <link rel="canonical" href={canonicalUrl} />
        {isDuplicate && <meta name="robots" content="noindex, follow" />}

        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.intro} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="M. Dailey Landscape & Design" />
        <meta property="article:published_time" content={post.date} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.intro} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <section className="w-full h-[180px] bg-gray-900 flex items-center">
        <div className="container mx-auto px-4">
          <h1 className="text-white text-3xl sm:text-4xl font-bold">{post.title}</h1>
        </div>
      </section>

      <article className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">

          <button
            onClick={() => onNavigate('blog')}
            className="inline-flex items-center gap-2 text-brand-primary hover:text-opacity-80 transition-colors mb-6 sm:mb-8 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </button>

          <header className="mb-8 sm:mb-10">
            <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base mb-4">
              <Calendar size={18} />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>

            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed italic border-l-4 border-brand-primary pl-4 sm:pl-6">
              {post.intro}
            </p>
          </header>

          <div
            className="prose prose-lg sm:prose-xl max-w-none my-10"
            style={{ lineHeight: '1.75' }}
            dangerouslySetInnerHTML={{ __html: linkifyContent(post.content) }}
            onClick={(e) => {
              const target = (e.target as HTMLElement).closest('a[data-internal="1"]') as HTMLAnchorElement | null;
              if (!target) return;
              e.preventDefault();
              const href = target.getAttribute('href');
              if (href === '/contact') onNavigate('contact');
              else if (href === '/services') onNavigate('services');
            }}
          />

          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between gap-4">

              {prev ? (
                <button
                  onClick={() => onNavigate('blog-post', prev.slug)}
                  className="flex items-center gap-2 text-brand-primary group flex-1"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500 mb-1">Previous Post</div>
                    <div className="font-semibold">{prev.title}</div>
                  </div>
                </button>
              ) : (
                <div className="flex-1" />
              )}

              {next ? (
                <button
                  onClick={() => onNavigate('blog-post', next.slug)}
                  className="flex items-center gap-2 text-brand-primary group flex-1 justify-end"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Next Post</div>
                    <div className="font-semibold">{next.title}</div>
                  </div>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="flex-1" />
              )}

            </div>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-10 text-center">
              Related Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((p) => (
                <article
                  key={p.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer"
                  onClick={() => onNavigate('blog-post', p.slug)}
                >
                  <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm mb-3">
                    <Calendar size={14} />
                    <time dateTime={p.date}>{formatDate(p.date)}</time>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <a
                      href={`/blog/${p.slug}`}
                      onClick={(e) => { e.preventDefault(); onNavigate('blog-post', p.slug); }}
                      className="hover:text-brand-primary transition-colors"
                    >
                      {p.title}
                    </a>
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
                    {p.intro}
                  </p>

                  <span className="inline-flex items-center gap-2 text-brand-primary font-semibold">
                    Read More
                    <ArrowRight size={16} />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Need Professional Landscaping Help?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Get expert advice and a free consultation from Chicago's trusted landscaping professionals.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-brand-primary text-white px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-semibold shadow-xl"
          >
            Get Free Quote
          </button>
        </div>
      </section>
    </div>
  );
}
