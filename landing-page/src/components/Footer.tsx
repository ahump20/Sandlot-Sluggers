import { Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-baseball-gray text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-3xl text-baseball-yellow mb-4">
              SANDLOT SLUGGERS
            </h3>
            <p className="text-white/70 mb-4">
              Experience arcade-style baseball with 100% original characters,
              physics-driven gameplay, and mobile-first controls.
            </p>
            <p className="text-white/60 text-sm">
              Built with ❤️ by Blaze Sports Intel
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xl text-baseball-yellow mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <a href="#hero" className="hover:text-baseball-yellow transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#stats" className="hover:text-baseball-yellow transition">
                  Live Stats
                </a>
              </li>
              <li>
                <a href="#characters" className="hover:text-baseball-yellow transition">
                  Characters
                </a>
              </li>
              <li>
                <a href="#stadiums" className="hover:text-baseball-yellow transition">
                  Stadiums
                </a>
              </li>
              <li>
                <a href="#leaderboard" className="hover:text-baseball-yellow transition">
                  Leaderboard
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-display text-xl text-baseball-yellow mb-4">
              Connect
            </h4>
            <div className="flex gap-4 mb-4">
              <a
                href="https://github.com/ahump20/Sandlot-Sluggers"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-baseball-yellow hover:text-baseball-gray transition"
              >
                <Github size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-baseball-yellow hover:text-baseball-gray transition"
              >
                <Twitter size={24} />
              </a>
              <a
                href="mailto:contact@blazesportsintel.com"
                className="bg-white/10 p-3 rounded-lg hover:bg-baseball-yellow hover:text-baseball-gray transition"
              >
                <Mail size={24} />
              </a>
            </div>
            <p className="text-white/60 text-sm">
              Follow us for updates and announcements
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/60 text-sm">
            © {new Date().getFullYear()} Sandlot Sluggers. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-white/60">
            <a href="#" className="hover:text-baseball-yellow transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-baseball-yellow transition">
              Terms of Service
            </a>
            <a
              href="https://github.com/ahump20/Sandlot-Sluggers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-baseball-yellow transition"
            >
              Open Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
