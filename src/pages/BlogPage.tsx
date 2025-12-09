import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (page: string, slug?: string) => void;
  page?: number;
}

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  date: string;
  intro: string;
}

export default function BlogPage({ onNavigate, page = 1 }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/harleensinghmalhotra/landscape1/main/public/blogs/blogs.json',
      { cache: 'no-store' } // ✅ CRITICAL FIX: disable caching
    )
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blog posts:', err);
        setLoading(false);
      });
  }, []);

  /* ✅ CRITICAL FIX: SORT NEWEST → OLDEST BEFORE PAGINATION */
  const sortedPosts = [...posts].sort((a, b) => {
  const dateDiff =
    new Date(b.date).getTime() - new Date(a.date).getTime();

  if (dateDiff !== 0) return dateDiff;

  // 👇 tie-breaker when dates are same
  return b.id - a.id;
});

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = sortedPosts.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePageChange = (newPage: number) => {
    onNavigate('blog', newPage.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostClick = (slug: string) => {
    onNavigate('blog-post', slug);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all text-sm sm:text-base ${
            i === currentPage
              ? 'bg-brand-primary text-white font-semibold'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Helmet>
        <title>Blog | M. Dailey Landscaping & Design</title>
        <meta
          name="description"
          content="Expert landscaping tips, design ideas, and maintenance guides for Chicago homeowners."
        />
        <link rel="canonical" href="https://mdaileylandscaping.com/blog" />
      </Helmet>

      {/* HERO */}
      <section className="relative h-[250px] sm:h-[300px] md:h-[350px] flex items-center bg-gray-900">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Landscaping Blog
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl">
            Expert tips, design ideas, and maintenance guides for Chicago homeowners
          </p>
        </div>
      </section>

      {/* BLOG LIST */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {currentPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No blog posts found.</p>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-10">
              {currentPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => handlePostClick(post.slug)}
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <Calendar size={16} />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 hover:text-brand-primary transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      {post.intro}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePostClick(post.slug);
                      }}
                      className="inline-flex items-center gap-2 bg-brand-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm sm:text-base shadow-md hover:shadow-lg"
                    >
                      Read More
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 sm:p-3 rounded-lg transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              {renderPagination()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 sm:p-3 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              Showing {startIndex + 1}–{Math.min(endIndex, sortedPosts.length)} of{' '}
              {sortedPosts.length} posts
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your Landscape?
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
