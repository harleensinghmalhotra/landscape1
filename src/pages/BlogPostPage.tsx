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
  headerImage?: string;      // ← main banner image
  inlineImages?: string[];   // ← multiple body images
}

export default function BlogPostPage({ onNavigate, slug }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('/blogs/blog-posts.json')   // ← FIXED HERE
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        setAllPosts(data);
        const foundPost = data.find((p) => p.slug === slug);
        setPost(foundPost || null);

        if (foundPost) {
          const related = data.filter((p) => p.slug !== slug).slice(0, 3);
          setRelatedPosts(related);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blog post:', err);
        setLoading(false);
      });
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPrevNextPosts = () => {
    if (!post) return { prev: null, next: null };
    const currentIndex = allPosts.findIndex((p) => p.id === post.id);
    return {
      prev: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
      next: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
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

  return (
    <div className="bg-white">
      <Helmet>
        <title>{post.title} | M. Dailey Landscaping & Design</title>
        <meta name="description" content={post.intro} />
        <link rel="canonical" href={`https://mdaileylandscaping.com/blog/${post.slug}`} />
      </Helmet>

      {/* MAIN BANNER IMAGE */}
      {post.headerImage && (
        <div className="w-full h-[260px] sm:h-[320px] md:h-[400px] overflow-hidden">
          <img
            src={post.headerImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

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

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed italic border-l-4 border-brand-primary pl-4 sm:pl-6">
              {post.intro}
            </p>
          </header>

          {/* INLINE IMAGES */}
          {post.inlineImages && post.inlineImages.length > 0 && (
            <div className="space-y-6 my-8">
              {post.inlineImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${post.title} - image ${i + 1}`}
                  className="w-full rounded-lg shadow-md object-cover"
                />
              ))}
            </div>
          )}

          {/* HTML BODY CONTENT */}
          <div
            className="prose prose-lg sm:prose-xl max-w-none"
            style={{ lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* PREV / NEXT BUTTONS */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {prev ? (
                <button
                  onClick={() => onNavigate('blog-post', prev.slug)}
                  className="flex items-center gap-2 text-brand-primary hover:text-opacity-80 transition-colors group flex-1"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500 mb-1">Previous Post</div>
                    <div className="font-semibold">{prev.title}</div>
                  </div>
                </button>
              ) : (
                <div className="flex-1"></div>
              )}

              {next ? (
                <button
                  onClick={() => onNavigate('blog-post', next.slug)}
                  className="flex items-center gap-2 text-brand-primary hover:text-opacity-80 transition-colors group flex-1 justify-end"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Next Post</div>
                    <div className="font-semibold">{next.title}</div>
                  </div>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="flex-1"></div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* RELATED ARTICLES */}
      {relatedPosts.length > 0 && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-10 text-center">
              Related Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {relatedPost.headerImage && (
                    <div className="w-full h-40 sm:h-48 overflow-hidden">
                      <img
                        src={relatedPost.headerImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm mb-3">
                      <Calendar size={14} />
                      <time dateTime={relatedPost.date}>{formatDate(relatedPost.date)}</time>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 hover:text-brand-primary transition-colors line-clamp-2">
                      <button
                        onClick={() => onNavigate('blog-post', relatedPost.slug)}
                        className="text-left w-full"
                      >
                        {relatedPost.title}
                      </button>
                    </h3>

                    <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
                      {relatedPost.intro}
                    </p>

                    <button
                      onClick={() => onNavigate('blog-post', relatedPost.slug)}
                      className="inline-flex items-center gap-2 text-brand-primary hover:gap-3 transition-all font-semibold text-sm sm:text-base"
                    >
                      Read More
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
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
            className="bg-brand-primary text-white px-8 sm:px-10 py-4 sm:py-5 rounded-lg hover:bg-opacity-90 transition-all font-semibold text-base sm:text-lg shadow-xl"
          >
            Get Free Quote
          </button>
        </div>
      </section>
    </div>
  );
}
