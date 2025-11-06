'use client';

import { useState } from 'react';
import { ALL_CHARACTERS } from '@/lib/characters';
import { Lock } from 'lucide-react';

export default function CharacterRoster() {
  const [selectedCharacter, setSelectedCharacter] = useState(ALL_CHARACTERS[0]);

  const StatBar = ({ label, value }: { label: string; value: number }) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold font-mono">{value}/10</span>
      </div>
      <div className="w-full bg-baseball-gray/20 rounded-full h-3">
        <div
          className="bg-baseball-red h-3 rounded-full transition-all duration-300"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gradient-to-b from-baseball-cream to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="section-heading">CHARACTER ROSTER</h2>
          <p className="text-xl text-baseball-gray/70">
            12 unique characters with distinct stats and abilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ALL_CHARACTERS.map((character) => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  className={`stat-card p-4 text-center cursor-pointer transition-all ${
                    selectedCharacter.id === character.id
                      ? 'border-baseball-red/60 bg-baseball-red/5 scale-105'
                      : 'hover:border-baseball-red/30 hover:scale-102'
                  } ${character.isSecret ? 'relative' : ''}`}
                >
                  {character.isSecret && (
                    <div className="absolute top-2 right-2">
                      <Lock size={16} className="text-baseball-yellow" />
                    </div>
                  )}
                  <div className="text-4xl mb-2">
                    {character.isSecret ? '🌟' : '⚾'}
                  </div>
                  <div className="font-display text-sm text-baseball-red">
                    {character.name}
                  </div>
                  <div className="text-xs text-baseball-gray/60 mt-1">
                    {character.position}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Character Detail Panel */}
          <div className="lg:col-span-1">
            <div className="stat-card sticky top-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {selectedCharacter.isSecret ? '🌟' : '⚾'}
                </div>
                <h3 className="font-display text-3xl text-baseball-red mb-2">
                  {selectedCharacter.name}
                </h3>
                <div className="inline-block bg-baseball-red text-white px-4 py-1 rounded-full text-sm font-bold">
                  {selectedCharacter.position}
                </div>
                {selectedCharacter.isSecret && (
                  <div className="mt-2 inline-block bg-baseball-yellow text-baseball-gray px-3 py-1 rounded-full text-xs font-bold">
                    SECRET CHARACTER
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-6">
                <h4 className="font-display text-xl text-baseball-gray mb-3">
                  BATTING STATS
                </h4>
                <StatBar label="Power" value={selectedCharacter.battingPower} />
                <StatBar
                  label="Accuracy"
                  value={selectedCharacter.battingAccuracy}
                />
                <StatBar label="Speed" value={selectedCharacter.speed} />
              </div>

              <div className="space-y-1 mb-6">
                <h4 className="font-display text-xl text-baseball-gray mb-3">
                  PITCHING STATS
                </h4>
                <StatBar label="Speed" value={selectedCharacter.pitchSpeed} />
                <StatBar label="Control" value={selectedCharacter.pitchControl} />
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-xl text-baseball-gray mb-3">
                  FIELDING STATS
                </h4>
                <StatBar label="Range" value={selectedCharacter.fieldingRange} />
                <StatBar
                  label="Accuracy"
                  value={selectedCharacter.fieldingAccuracy}
                />
              </div>

              {/* Overall Rating */}
              <div className="mt-6 pt-6 border-t-2 border-baseball-gray/20">
                <div className="text-center">
                  <div className="text-sm text-baseball-gray/60 mb-1">
                    OVERALL RATING
                  </div>
                  <div className="font-display text-5xl text-baseball-red">
                    {Math.round(
                      (selectedCharacter.battingPower +
                        selectedCharacter.battingAccuracy +
                        selectedCharacter.speed +
                        selectedCharacter.pitchSpeed +
                        selectedCharacter.pitchControl +
                        selectedCharacter.fieldingRange +
                        selectedCharacter.fieldingAccuracy) /
                        7 *
                        10
                    )}
                    <span className="text-2xl text-baseball-gray">/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
