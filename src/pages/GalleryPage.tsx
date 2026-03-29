import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface GalleryPageProps {
  onNavigate: (page: string) => void;
}

export default function GalleryPage({ onNavigate }: GalleryPageProps) {
  const [beforeAfterSlider, setBeforeAfterSlider] = useState(50);

  const beforeAfterProjects = [
    {
      before: '/After 1.png',
      after: '/Before 1.jpg',
      title: 'Backyard Paver Patio & Pergola',
      description: 'Complete backyard transformation in Chicago featuring a custom cedar pergola, jacuzzi pad, stone fire pit, and Unilock paver patio.',
      alt: 'Chicago backyard patio design with pergola and fire pit'
    },
    {
      before: '/After 2.jpg',
      after: '/Before 2.png',
      title: 'Front Yard Curb Appeal Renovation',
      description: 'Total front yard makeover including a new modular retaining wall, fresh sod installation, and a decorative paver walkway with landscape lighting.',
      alt: 'Front yard landscaping makeover with retaining wall and sod'
    },
    {
      before: '/After 3.jpg',
      after: '/Before 3.jpg',
      title: 'Herringbone Paver Driveway Replacement',
      description: 'Replaced a collapsed asphalt driveway with a reinforced base and premium brick pavers laid in a classic herringbone pattern.',
      alt: 'Brick paver driveway installation herringbone pattern'
    },
    {
      before: '/After 4.jpg',
      after: '/Before 4.jpg',
      title: 'Lake Michigan Bluff Restoration',
      description: 'Restored an eroded lakefront slope with a leveled cedar mulch bed and expanded walkway to maximize Lake Michigan views.',
      alt: 'Lakefront erosion control and landscaping'
    },
    {
      before: '/After 5.png',
      after: '/Before 5.jpg',
      title: 'Seasonal Property Maintenance',
      description: 'Comprehensive fall cleanup and winter prep: debris removal, hydrangea pruning, and fresh mulch application.',
      alt: 'Fall landscaping cleanup and mulch installation'
    },
    {
      before: '/After 6.png',
      after: '/Before 6.jpg',
      title: 'Zen Garden Design & Water Feature',
      description: 'Transformed a narrow side yard into a Japanese-inspired retreat featuring a river stone water feature, Buddha statue, and ornamental plantings.',
      alt: 'Japanese garden design with water feature'
    },
    {
      before: '/After 7.jpg',
      after: '/Before 7.jpg',
      title: 'Sod Installation & Retaining Wall',
      description: 'Corrected an uneven yard with professional grading, a decorative block retaining wall, and fresh Kentucky Bluegrass sod.',
      alt: 'Grading and sod installation with retaining wall'
    },
    {
      before: '/After 8.jpg',
      after: '/Before 8.jpg',
      title: 'Natural Stone Walkway Upgrade',
      description: 'Replaced a worn grass path with a custom flagstone walkway, featuring natural stone pavers, decorative gravel fill, and steel edging.',
      alt: 'Natural flagstone walkway with gravel'
    },
    {
      before: '/After 9.jpg',
      after: '/Before 9.jpg',
      title: 'New Construction Landscape Design',
      description: 'Turned a blank construction site into a move-in ready property with gravel partitions, foundation plantings, and parkway trees.',
      alt: 'New construction landscaping Chicago'
    },
    {
      before: '/After 10.jpg',
      after: '/Before 10.jpg',
      title: 'Privacy Screen & Yard Renovation',
      description: 'Installed a decorative retaining wall and a row of evergreen Arborvitae trees to create a lush, natural privacy screen.',
      alt: 'Backyard privacy screen with Arborvitae trees'
    },
    {
      before: '/After 11.jpg',
      after: '/Before 11.jpg',
      title: 'Deck Restoration & Power Washing',
      description: 'Restored a weathered wood deck to like-new condition with professional power washing and premium staining.',
      alt: 'Wood deck power washing and staining'
    },
    {
      before: '/After 12.jpg',
      after: '/Before 12.jpg',
      title: 'Paver Parking Pad Installation',
      description: 'Converted an old rear parking spot into a multi-functional paver pad and walkway, increasing usable outdoor space.',
      alt: 'Backyard paver parking pad installation'
    }
  ];

  return (
    <div className="bg-white">
      <Helmet>
        <title>Project Gallery | Landscaping & Hardscaping Photos Chicago</title>
        <meta name="description" content="See our portfolio of residential and commercial landscaping projects in Chicago. Before and after photos of patios, driveways, and gardens." />
        <link rel="canonical" href="https://mdaileylandscaping.com/gallery" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] flex items-center bg-black">
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/1.png)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8)' }}>
              Chicago Landscaping Portfolio
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.95), 0 0 25px rgba(0,0,0,0.9), 0 0 35px rgba(0,0,0,0.7)' }}>
              Explore our recent <strong>residential and commercial</strong> transformations across Chicago and the North Shore.
            </p>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-10 sm:py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Before & After Transformations
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              See the dramatic difference professional landscaping makes
            </p>
          </div>

          <div className="space-y-10 sm:space-y-12 md:space-y-16">
            {beforeAfterProjects.map((project, index) => (
              <div key={index} className="max-w-5xl mx-auto">
                <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{project.description}</p>

                  <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden rounded-xl">
                    {/* After Image (base layer) */}
                    <img
                      src={project.after}
                      alt={`Completed ${project.alt}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Before Image with clip (overlay) */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 0 0 ${beforeAfterSlider}%)` }}
                    >
                      <img
                        src={project.before}
                        alt={`Before ${project.alt}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Slider */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                      style={{ left: `${beforeAfterSlider}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-xl">
                        <div className="flex gap-1">
                          <ChevronLeft size={20} className="text-brand-primary" />
                          <ChevronRight size={20} className="text-brand-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm md:text-base">
                      BEFORE
                    </div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-brand-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm md:text-base">
                      AFTER
                    </div>

                    {/* Slider input */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={beforeAfterSlider}
                      onChange={(e) => setBeforeAfterSlider(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-12 md:py-20 bg-brand-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your Property?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-brand-accent mb-6 sm:mb-8 max-w-2xl mx-auto">
            Get a free consultation and quote from Chicago's trusted landscaping professionals.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-white text-brand-primary px-8 sm:px-10 py-4 sm:py-5 rounded-lg hover:bg-gray-100 transition-all font-semibold text-base sm:text-lg shadow-xl inline-flex items-center gap-2"
          >
            Get Free Quote
            <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>

    </div>
  );
}