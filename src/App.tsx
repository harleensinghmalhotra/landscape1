import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CareersPage from './pages/CareersPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import CityPage from './pages/CityPage';

type RouteState = { page: string; params?: string };

function pathToRoute(pathname: string, search: string): RouteState {
  const path = pathname.replace(/\/+$/, '') || '/';
  const queryPage = new URLSearchParams(search).get('page');

  if (path === '/' || path === '') return { page: 'home' };
  if (path === '/services') return { page: 'services' };
  if (path === '/gallery') return { page: 'gallery' };
  if (path === '/about') return { page: 'about' };
  if (path === '/contact') return { page: 'contact' };
  if (path === '/careers') return { page: 'careers' };
  if (path === '/blog') return { page: 'blog', params: queryPage || undefined };

  const blogMatch = path.match(/^\/blog\/(.+)$/);
  if (blogMatch) return { page: 'blog-post', params: blogMatch[1] };

  const cityMatch = path.match(/^\/landscaping-(.+)$/);
  if (cityMatch) return { page: 'city', params: cityMatch[1] };

  return { page: 'home' };
}

function routeToPath(page: string, params?: string): string {
  switch (page) {
    case 'home': return '/';
    case 'services': return '/services';
    case 'gallery': return '/gallery';
    case 'about': return '/about';
    case 'contact': return '/contact';
    case 'careers': return '/careers';
    case 'blog': return params && params !== '1' ? `/blog?page=${params}` : '/blog';
    case 'blog-post': return `/blog/${params || ''}`;
    case 'city': return `/landscaping-${params || ''}`;
    default: return '/';
  }
}

export default function App() {
  const initial = typeof window !== 'undefined'
    ? pathToRoute(window.location.pathname, window.location.search)
    : { page: 'home' };

  const [currentPage, setCurrentPage] = useState(initial.page);
  const [pageParams, setPageParams] = useState<string | undefined>(initial.params);

  useEffect(() => {
    const onPop = () => {
      const r = pathToRoute(window.location.pathname, window.location.search);
      setCurrentPage(r.page);
      setPageParams(r.params);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleNavigate = (page: string, params?: string) => {
    const target = routeToPath(page, params);
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== target) {
      window.history.pushState({ page, params }, '', target);
    }
    setCurrentPage(page);
    setPageParams(params);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={handleNavigate} />;
      case 'services': return <ServicesPage onNavigate={handleNavigate} />;
      case 'gallery': return <GalleryPage onNavigate={handleNavigate} />;
      case 'about': return <AboutPage onNavigate={handleNavigate} />;
      case 'contact': return <ContactPage onNavigate={handleNavigate} />;
      case 'careers': return <CareersPage onNavigate={handleNavigate} />;
      case 'blog': return <BlogPage onNavigate={handleNavigate} page={pageParams ? parseInt(pageParams) : 1} />;
      case 'blog-post': return <BlogPostPage onNavigate={handleNavigate} slug={pageParams || ''} />;
      case 'city': return <CityPage onNavigate={handleNavigate} citySlug={pageParams || ''} />;
      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main>{renderPage()}</main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
