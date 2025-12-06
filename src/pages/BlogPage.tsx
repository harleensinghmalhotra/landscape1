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
  content: string;
  headerImage?: string;
}

export default function BlogPage({ onNavigate, page = 1 }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    fetch('/blogs/blog-posts.json')     // ⭐ FIXED PATH
      .then((r) => r.json())
      .then((data) => {
        const processed = data.map((post: BlogPost) => ({
          ...post,
          // ⭐ FIX: Auto prepend /blog-images/ if missing to avoid N8N mistakes
          headerImage: post.headerImage
            ? post.headerImage.startsWith('/blog-images/')
              ? post.headerImage
              : `/blog-images/${post.headerImage}`
            : undefined
        }));

        setPosts(processed);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blog posts:', err);
        setLoading(false);
      });
  }, []);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

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

      {/* HERO BANNER */}
      <section
        className="relative h-[300px] sm:h-[350px] md:h-[400px] flex items-center"
        style={{
          backgroundImage: "url('/banner2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Landscaping Blog
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-2xl">
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
                  className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >

                  {/* FEATURED IMAGE */}
                  {post.headerImage && (
                    <div className="w-full h-56 sm:h-64 md:h-72 overflow-hidden">
                      <img
                        src={post.headerImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                        onClick={() => handlePostClick(post.slug)}
                      />
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <Calendar size={16} />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 hover:text-brand-primary transition-colors">
                      <button
                        onClick={() => handlePostClick(post.slug)}
                        className="text-left w-full"
                      >
                        {post.title}
                      </button>
                    </h2>

                    <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      {post.intro}
                    </p>

                    <button
                      onClick={() => handlePostClick(post.slug)}
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
              Showing {startIndex + 1}-{Math.min(endIndex, posts.length)} of {posts.length} posts
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
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
