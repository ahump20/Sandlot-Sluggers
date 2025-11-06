'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';

const STADIUMS = [
  {
    id: 'stadium_001',
    name: 'Dusty Acres',
    description: 'A dusty desert diamond with tumbleweeds and cacti',
    dimensions: { leftField: 32, centerField: 38, rightField: 32 },
    theme: 'Desert',
    icon: '🏜️',
  },
  {
    id: 'stadium_002',
    name: 'Frostbite Field',
    description: 'Snow-covered outfield with icy patches',
    dimensions: { leftField: 30, centerField: 35, rightField: 30 },
    theme: 'Winter',
    icon: '❄️',
  },
  {
    id: 'stadium_003',
    name: 'Treehouse Park',
    description: 'Elevated platform among giant trees',
    dimensions: { leftField: 28, centerField: 33, rightField: 28 },
    theme: 'Forest',
    icon: '🌳',
  },
  {
    id: 'stadium_004',
    name: 'Rooftop Rally',
    description: 'City rooftop with skyscraper backdrop',
    dimensions: { leftField: 34, centerField: 40, rightField: 34 },
    theme: 'Urban',
    icon: '🏙️',
  },
  {
    id: 'stadium_005',
    name: 'Beach Bash',
    description: 'Sandy diamond with ocean waves',
    dimensions: { leftField: 31, centerField: 36, rightField: 31 },
    theme: 'Beach',
    icon: '🏖️',
  },
];

export default function StadiumShowcase() {
  const [selectedStadium, setSelectedStadium] = useState(STADIUMS[4]); // Beach Bash default

  return (
    <section className="py-20 bg-baseball-gray text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="section-heading text-baseball-yellow">
            EPIC STADIUMS
          </h2>
          <p className="text-xl text-white/80">
            5 unique venues, each with its own character
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Stadium Selector */}
          <div>
            <div className="space-y-4">
              {STADIUMS.map((stadium) => (
                <button
                  key={stadium.id}
                  onClick={() => setSelectedStadium(stadium)}
                  className={`w-full stat-card text-left transition-all ${
                    selectedStadium.id === stadium.id
                      ? 'bg-baseball-yellow/20 border-baseball-yellow/60 scale-105'
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{stadium.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-display text-2xl text-baseball-yellow mb-1">
                        {stadium.name}
                      </h3>
                      <p className="text-white/70 text-sm mb-3">
                        {stadium.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <MapPin size={14} />
                        <span>{stadium.theme} Theme</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stadium Details */}
          <div>
            <div className="stat-card bg-white/10 border-baseball-yellow/40 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">{selectedStadium.icon}</div>
                <h3 className="font-display text-4xl text-baseball-yellow mb-2">
                  {selectedStadium.name}
                </h3>
                <p className="text-white/80 text-lg">
                  {selectedStadium.description}
                </p>
              </div>

              {/* Field Dimensions */}
              <div className="mb-8">
                <h4 className="font-display text-2xl text-white mb-4 text-center">
                  FIELD DIMENSIONS
                </h4>

                {/* Visual representation of field */}
                <div className="relative bg-baseball-green/30 rounded-lg p-8 mb-4">
                  <div className="text-center space-y-4">
                    <div className="inline-block bg-baseball-yellow text-baseball-gray px-4 py-2 rounded font-mono font-bold">
                      CF: {selectedStadium.dimensions.centerField} units
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="bg-baseball-yellow text-baseball-gray px-4 py-2 rounded font-mono font-bold">
                        LF: {selectedStadium.dimensions.leftField}
                      </div>
                      <div className="bg-baseball-yellow text-baseball-gray px-4 py-2 rounded font-mono font-bold">
                        RF: {selectedStadium.dimensions.rightField}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-display text-baseball-yellow">
                      {selectedStadium.dimensions.leftField}
                    </div>
                    <div className="text-sm text-white/60">Left Field</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display text-baseball-yellow">
                      {selectedStadium.dimensions.centerField}
                    </div>
                    <div className="text-sm text-white/60">Center Field</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display text-baseball-yellow">
                      {selectedStadium.dimensions.rightField}
                    </div>
                    <div className="text-sm text-white/60">Right Field</div>
                  </div>
                </div>
              </div>

              {/* Best For */}
              <div className="pt-6 border-t-2 border-white/20">
                <h4 className="font-display text-xl text-white mb-3 text-center">
                  BEST FOR
                </h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedStadium.dimensions.centerField >= 38 && (
                    <span className="bg-baseball-red text-white px-3 py-1 rounded-full text-sm">
                      Power Hitters
                    </span>
                  )}
                  {selectedStadium.dimensions.centerField <= 33 && (
                    <span className="bg-baseball-green text-white px-3 py-1 rounded-full text-sm">
                      Contact Hitters
                    </span>
                  )}
                  {selectedStadium.theme === 'Beach' && (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Fun Atmosphere
                    </span>
                  )}
                  {selectedStadium.theme === 'Desert' && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                      Hot Weather
                    </span>
                  )}
                  <span className="bg-baseball-yellow text-baseball-gray px-3 py-1 rounded-full text-sm">
                    {selectedStadium.theme} Theme
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
