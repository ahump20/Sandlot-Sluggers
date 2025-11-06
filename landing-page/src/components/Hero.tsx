import { Play, GitBranch } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-baseball-red to-baseball-red/80 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Main heading */}
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl mb-6 drop-shadow-2xl float-animation">
          SANDLOT SLUGGERS
        </h1>

        {/* Tagline */}
        <p className="text-2xl md:text-3xl lg:text-4xl mb-4 font-light">
          Backyard Baseball Reimagined
        </p>

        <p className="text-lg md:text-xl mb-12 text-white/90 max-w-2xl mx-auto">
          Experience arcade-style baseball with 100% original characters,
          physics-driven gameplay, and mobile-first controls
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <a
            href="/"
            className="btn-primary flex items-center gap-2 text-lg"
          >
            <Play size={24} />
            PLAY NOW
          </a>
          <a
            href="https://github.com/ahump20/Sandlot-Sluggers"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-baseball-red font-bold py-3 px-8 rounded-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 text-lg"
          >
            <GitBranch size={24} />
            VIEW ON GITHUB
          </a>
        </div>

        {/* Features highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-2 border-white/20">
            <div className="text-4xl mb-2">⚾</div>
            <h3 className="font-display text-2xl mb-2">12 Unique Characters</h3>
            <p className="text-white/80">
              100% original IP with diverse stats and positions
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-2 border-white/20">
            <div className="text-4xl mb-2">🏟️</div>
            <h3 className="font-display text-2xl mb-2">5 Epic Stadiums</h3>
            <p className="text-white/80">
              From desert diamonds to beachside fields
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-2 border-white/20">
            <div className="text-4xl mb-2">📱</div>
            <h3 className="font-display text-2xl mb-2">Mobile-First</h3>
            <p className="text-white/80">
              Touch-optimized controls with PWA support
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce text-white/60">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
