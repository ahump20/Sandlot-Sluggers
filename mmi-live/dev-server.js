/**
 * Local Development Server for MMI
 * Mocks MLB API responses for testing without live games
 */

const http = require('http');
const url = require('url');

// In-memory storage (simulates D1 database)
const database = {
  mmi_moments: [],
  game_summary: {},
  player_streaks: {}
};

// In-memory cache (simulates KV)
const cache = new Map();

// Mock MLB API data
const mockGames = {
  "2024-11-21": {
    dates: [{
      games: [
        {
          gamePk: 717519,
          gameDate: "2024-11-21T19:05:00Z",
          status: { abstractGameState: "Live" },
          teams: {
            away: { team: { name: "New York Yankees" } },
            home: { team: { name: "Boston Red Sox" } }
          }
        },
        {
          gamePk: 717520,
          gameDate: "2024-11-21T19:10:00Z",
          status: { abstractGameState: "Live" },
          teams: {
            away: { team: { name: "Los Angeles Dodgers" } },
            home: { team: { name: "San Francisco Giants" } }
          }
        }
      ]
    }]
  }
};

const mockGameData = {
  717519: {
    liveData: {
      linescore: {
        currentInning: 7,
        inningHalf: "bottom",
        teams: {
          home: { runs: 4 },
          away: { runs: 3 }
        }
      },
      plays: {
        currentPlay: {
          count: { outs: 2, balls: 3, strikes: 2 },
          matchup: {
            pitcher: { id: 592789, fullName: "Gerrit Cole" },
            batter: { id: 502110, fullName: "Rafael Devers" },
            postOnFirst: true,
            postOnSecond: false,
            postOnThird: true
          },
          playEvents: [
            {
              details: {
                description: "Ball"
              }
            }
          ]
        }
      },
      boxscore: {
        teams: {
          home: {
            pitchers: [592789]
          }
        }
      }
    }
  },
  717520: {
    liveData: {
      linescore: {
        currentInning: 3,
        inningHalf: "top",
        teams: {
          home: { runs: 1 },
          away: { runs: 1 }
        }
      },
      plays: {
        currentPlay: {
          count: { outs: 0, balls: 0, strikes: 0 },
          matchup: {
            pitcher: { id: 621111, fullName: "Logan Webb" },
            batter: { id: 660271, fullName: "Mookie Betts" },
            postOnFirst: false,
            postOnSecond: false,
            postOnThird: false
          },
          playEvents: []
        }
      },
      boxscore: {
        teams: {
          home: {
            pitchers: [621111]
          }
        }
      }
    }
  }
};

const mockPitcherStats = {
  592789: { // Gerrit Cole
    pitchCount: 95,
    daysSinceLastAppearance: 0,
    season: { era: 3.20, whip: 1.05 }
  },
  621111: { // Logan Webb
    pitchCount: 45,
    daysSinceLastAppearance: 4,
    season: { era: 3.45, whip: 1.12 }
  }
};

/**
 * Mock MLB API
 */
function mockMLBAPI(path) {
  const today = new Date().toISOString().split('T')[0];
  
  if (path.includes('/schedule')) {
    return mockGames[today];
  }
  
  if (path.includes('/game/')) {
    const gameId = path.match(/\/game\/(\d+)\//)?.[1];
    return { liveData: mockGameData[gameId]?.liveData || {} };
  }
  
  if (path.includes('/people/')) {
    const pitcherId = path.match(/\/people\/(\d+)\//)?.[1];
    return {
      stats: [{
        splits: [{
          stat: mockPitcherStats[pitcherId] || {},
          date: new Date().toISOString().split('T')[0]
        }]
      }]
    };
  }
  
  return {};
}

/**
 * Calculate MMI (same logic as worker)
 */
function calculateMMI(situation, pitcherStats) {
  // Leverage Index
  let inningFactor = 1.0;
  if (situation.inning >= 7) inningFactor = 1.5;
  if (situation.inning >= 9) inningFactor = 2.0;
  
  const scoreDiff = Math.abs(situation.homeScore - situation.awayScore);
  let scoreFactor = scoreDiff === 0 ? 2.0 : scoreDiff === 1 ? 1.7 : scoreDiff === 2 ? 1.3 : 0.8;
  
  const runnersOn = [situation.onFirst, situation.onSecond, situation.onThird].filter(Boolean).length;
  const runnerFactor = runnersOn === 0 ? 0.8 : runnersOn === 3 ? 2.0 : 1.0 + (runnersOn * 0.4);
  
  const outsFactor = situation.outs === 0 ? 0.9 : situation.outs === 2 ? 1.4 : 1.1;
  
  const leverageIndex = inningFactor * scoreFactor * runnerFactor * outsFactor;
  
  // Pressure
  const countPressure = (situation.balls === 3 && situation.strikes === 2) ? 80 : 40;
  const inningPressure = situation.inning >= 9 ? 70 : situation.inning >= 7 ? 50 : 30;
  const outsPressure = situation.outs === 2 ? 70 : 40;
  const pressure = (countPressure + inningPressure + outsPressure) / 3;
  
  // Fatigue
  const pitchCount = pitcherStats.pitchCount || 0;
  let pitchFatigue = 30;
  if (pitchCount > 80) pitchFatigue = 60;
  if (pitchCount > 100) pitchFatigue = 80;
  if (pitchCount > 120) pitchFatigue = 95;
  
  const daysSince = pitcherStats.daysSinceLastAppearance || 3;
  let restFatigue = daysSince === 0 ? 70 : daysSince === 1 ? 50 : 20;
  
  const fatigue = (pitchFatigue * 0.7) + (restFatigue * 0.3);
  
  // Execution
  const countDifficulty = (situation.balls === 3 && situation.strikes === 2) ? 85 : 50;
  const execution = countDifficulty;
  
  // Bio
  const bio = 50;
  
  // Z-scores
  const zScores = {
    leverageIndex: (leverageIndex - 1.0) / 0.8,
    pressure: (pressure - 50) / 25,
    fatigue: (fatigue - 50) / 20,
    execution: (execution - 50) / 15,
    bio: (bio - 50) / 10
  };
  
  // Weighted MMI
  const mmiRaw = (
    zScores.leverageIndex * 0.35 +
    zScores.pressure * 0.20 +
    zScores.fatigue * 0.20 +
    zScores.execution * 0.15 +
    zScores.bio * 0.10
  );
  
  const mmi = Math.max(0, Math.min(100, 50 + (mmiRaw * 15)));
  
  return {
    mmi: Math.round(mmi * 10) / 10,
    components: {
      leverageIndex: { raw: leverageIndex, zScore: zScores.leverageIndex, weight: 0.35 },
      pressure: { raw: pressure, zScore: zScores.pressure, weight: 0.20 },
      fatigue: { raw: fatigue, zScore: zScores.fatigue, weight: 0.20 },
      execution: { raw: execution, zScore: zScores.execution, weight: 0.15 },
      bio: { raw: bio, zScore: zScores.bio, weight: 0.10 }
    }
  };
}

/**
 * HTTP request handler
 */
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Route: Today's games
    if (path === '/mmi/games/today') {
      const today = new Date().toISOString().split('T')[0];
      const data = mockMLBAPI(`/schedule?date=${today}`);
      const games = data.dates?.[0]?.games || [];
      
      res.writeHead(200);
      res.end(JSON.stringify({
        date: today,
        games: games.map(g => ({
          gameId: g.gamePk,
          status: g.status.abstractGameState,
          teams: {
            away: g.teams.away.team.name,
            home: g.teams.home.team.name
          },
          time: g.gameDate
        }))
      }));
      return;
    }
    
    // Route: Calculate MMI
    if (path.startsWith('/mmi/') && path !== '/mmi/games/today' && !path.includes('history') && !path.includes('top')) {
      const gameId = path.split('/')[2];
      const gameData = mockMLBAPI(`/game/${gameId}/feed/live`);
      
      if (!gameData.liveData) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Game not found' }));
        return;
      }
      
      const currentPlay = gameData.liveData.plays.currentPlay;
      const linescore = gameData.liveData.linescore;
      
      const situation = {
        inning: linescore.currentInning,
        inningHalf: linescore.inningHalf,
        outs: currentPlay.count?.outs || 0,
        balls: currentPlay.count?.balls || 0,
        strikes: currentPlay.count?.strikes || 0,
        onFirst: currentPlay.matchup.postOnFirst !== undefined,
        onSecond: currentPlay.matchup.postOnSecond !== undefined,
        onThird: currentPlay.matchup.postOnThird !== undefined,
        homeScore: linescore.teams.home.runs,
        awayScore: linescore.teams.away.runs,
        pitcher: currentPlay.matchup.pitcher,
        batter: currentPlay.matchup.batter
      };
      
      const pitcherStats = mockPitcherStats[situation.pitcher.id] || {};
      const result = calculateMMI(situation, pitcherStats);
      
      const response = {
        gameId,
        timestamp: new Date().toISOString(),
        mmi: result.mmi,
        category: result.mmi >= 70 ? 'Elite Pressure' : result.mmi >= 55 ? 'High Difficulty' : result.mmi >= 40 ? 'Moderate' : 'Routine',
        components: result.components,
        situation: {
          inning: situation.inning,
          half: situation.inningHalf,
          outs: situation.outs,
          count: `${situation.balls}-${situation.strikes}`,
          baserunners: [
            situation.onFirst ? '1B' : null,
            situation.onSecond ? '2B' : null,
            situation.onThird ? '3B' : null
          ].filter(Boolean).join(', ') || 'Empty',
          score: `${situation.awayScore}-${situation.homeScore}`
        },
        players: {
          pitcher: { id: situation.pitcher.id, name: situation.pitcher.fullName },
          batter: { id: situation.batter.id, name: situation.batter.fullName }
        }
      };
      
      // Store to mock database
      database.mmi_moments.push(response);
      
      res.writeHead(200);
      res.end(JSON.stringify(response, null, 2));
      return;
    }
    
    // Route: Top moments
    if (path.startsWith('/mmi/top')) {
      const moments = database.mmi_moments
        .sort((a, b) => b.mmi - a.mmi)
        .slice(0, 10);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        timeframe: '7 days',
        count: moments.length,
        moments: moments.map(m => ({
          game_id: m.gameId,
          mmi_score: m.mmi,
          category: m.category,
          inning: m.situation.inning,
          inning_half: m.situation.half,
          outs: m.situation.outs,
          count: m.situation.count,
          recorded_at: m.timestamp
        }))
      }));
      return;
    }
    
    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Start server
const PORT = process.env.PORT || 8787;
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('\n🚀 MMI Development Server');
  console.log('═'.repeat(50));
  console.log(`\n📍 Server running at http://localhost:${PORT}`);
  console.log('\n🔗 Available endpoints:');
  console.log(`   GET http://localhost:${PORT}/mmi/games/today`);
  console.log(`   GET http://localhost:${PORT}/mmi/717519 (Yankees @ Red Sox)`);
  console.log(`   GET http://localhost:${PORT}/mmi/717520 (Dodgers @ Giants)`);
  console.log(`   GET http://localhost:${PORT}/mmi/top`);
  console.log('\n💡 Using mock MLB API data for testing');
  console.log(`\nPress Ctrl+C to stop\n`);
});
