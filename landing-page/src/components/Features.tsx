import { Gamepad2, Zap, Cloud, TrendingUp, Users, Award } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Gamepad2 size={40} />,
      title: 'Physics-Driven Gameplay',
      description:
        'Experience realistic ball physics powered by Havok engine with gravity, velocity, and trajectory calculations.',
    },
    {
      icon: <Zap size={40} />,
      title: 'Touch-Optimized Controls',
      description:
        'Mobile-first design with intuitive tap-to-swing mechanics. Play anywhere, anytime on any device.',
    },
    {
      icon: <Cloud size={40} />,
      title: 'Cloud Progression',
      description:
        'Your progress syncs across devices via Cloudflare edge network. Never lose your achievements.',
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Character Unlocks',
      description:
        'Progress through levels to unlock new characters and stadiums. Discover secret players with perfect stats!',
    },
    {
      icon: <Users size={40} />,
      title: 'Multiplayer Ready',
      description:
        'Compete against friends in real-time PvP matches. Join leagues and climb the global rankings.',
    },
    {
      icon: <Award size={40} />,
      title: 'Achievements System',
      description:
        'Complete challenges and earn achievements. Track your stats and become a legend of the sandlot.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="section-heading">GAME FEATURES</h2>
          <p className="text-xl text-baseball-gray/70">
            Built with modern web technology for the ultimate experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="stat-card hover:scale-105 transition-transform"
            >
              <div className="text-baseball-red mb-4">{feature.icon}</div>
              <h3 className="font-display text-2xl text-baseball-gray mb-3">
                {feature.title}
              </h3>
              <p className="text-baseball-gray/70">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mt-16 pt-16 border-t-2 border-baseball-gray/20">
          <h3 className="subsection-heading text-center mb-8">
            POWERED BY CUTTING-EDGE TECH
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 text-baseball-gray/60">
            <div className="text-center">
              <div className="font-bold text-lg text-baseball-red">
                Babylon.js 7
              </div>
              <div className="text-sm">3D Engine</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-baseball-red">
                Havok Physics
              </div>
              <div className="text-sm">Realistic Physics</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-baseball-red">
                Cloudflare
              </div>
              <div className="text-sm">Edge Computing</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-baseball-red">
                TypeScript
              </div>
              <div className="text-sm">Type Safety</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-baseball-red">PWA</div>
              <div className="text-sm">Mobile Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
