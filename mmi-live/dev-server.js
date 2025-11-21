/**
 * Local Development Server for MMI Testing
 * Mock MLB API and in-memory database
 */

const http = require('http');

// In-memory database
const db = {
  moments: [],
  games: []
};

// Mock MLB API responses
const mockGameData = {
  '717715': {
    gameData: {
      game: {
        pk: 717715,
        gameDate: new Date().toISOString()
      }
    },
    liveData: {
      linescore: {
        currentInning: 9,
        inningHalf: 'bottom',
        away: { runs: 3 },
        home: { runs: 4 }
      },
      boxscore: {
        teams: {
          away: { pitchers: [] },
          home: { pitchers: [] }
        }
      }
    }
  }
};

const mockPlayByPlay = {
  '717715': {
    allPlays: [{
      count: { balls: 3, strikes: 2, outs: 2 },
      runners: [
        { details: { isScoringEvent: false } },
        { details: { isScoringEvent: false } },
        { details: { isScoringEvent: false } }
      ],
      matchup: {
        pitcher: { id: '12345' }
      },
      pitchData: {
        startSpeed: 96,
        type: { code: 'SL' }
      }
    }]
  }
};

// Simplified MMI calculation (same as worker)
function calculateMMI(gameState, pitcherData, pitchData, playContext) {
  // Simplified calculation for dev server
  let mmi = 50;
  
  // Leverage adjustments
  if (gameState.inning >= 9) mmi += 15;
  if (gameState.bases === 'loaded') mmi += 20;
  if (gameState.count === '3-2') mmi += 15;
  if (Math.abs(gameState.scoreDiff) <= 1) mmi += 10;
  
  // Fatigue
  if (pitcherData.pitchCount > 80) mmi += 10;
  
  // Execution
  if (pitchData.velocity > 95) mmi += 5;
  
  return Math.max(0, Math.min(100, mmi));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Route: GET /mmi/games/today
  if (path === '/mmi/games/today' || path === '/mmi/games/today/') {
    res.writeHead(200);
    res.end(JSON.stringify({
      games: [
        {
          gamePk: 717715,
          gameDate: new Date().toISOString(),
          teams: {
            away: { team: { name: 'Yankees' } },
            home: { team: { name: 'Red Sox' } }
          }
        }
      ]
    }));
    return;
  }
  
  // Route: GET /mmi/:gameId
  if (path.match(/^\/mmi\/(\d+)$/)) {
    const gameId = path.match(/^\/mmi\/(\d+)$/)[1];
    
    const gameData = mockGameData[gameId] || mockGameData['717715'];
    const playByPlay = mockPlayByPlay[gameId] || mockPlayByPlay['717715'];
    const currentPlay = playByPlay.allPlays[playByPlay.allPlays.length - 1];
    
    const gameState = {
      inning: gameData.liveData.linescore.currentInning,
      halfInning: gameData.liveData.linescore.inningHalf,
      outs: currentPlay.count.outs,
      bases: currentPlay.runners.length === 3 ? 'loaded' : 
             currentPlay.runners.length > 0 ? 'scoring' : 'empty',
      scoreDiff: gameData.liveData.linescore.away.runs - gameData.liveData.linescore.home.runs,
      count: `${currentPlay.count.balls}-${currentPlay.count.strikes}`
    };
    
    const pitcherData = {
      pitchCount: 85,
      restDays: 1,
      role: 'closer',
      avgTempo: 24,
      recentERA: 4.5
    };
    
    const pitchData = {
      velocity: currentPlay.pitchData?.startSpeed || 92,
      type: currentPlay.pitchData?.type?.code?.toLowerCase() || 'fastball'
    };
    
    const playContext = {
      timeouts: 1,
      gameImportance: Math.abs(gameState.scoreDiff) <= 2 ? 'high' : 'normal',
      recentSubstitutions: 0
    };
    
    const mmi = calculateMMI(gameState, pitcherData, pitchData, playContext);
    
    // Store in memory
    const moment = {
      game_id: gameId,
      player_id: currentPlay.matchup.pitcher.id,
      mmi_score: mmi,
      created_at: new Date().toISOString()
    };
    db.moments.push(moment);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      gameId,
      playerId: currentPlay.matchup.pitcher.id,
      mmi: Math.round(mmi * 10) / 10,
      timestamp: moment.created_at,
      components: {
        leverageIndex: 2.3,
        pressure: 75.0,
        fatigue: 65.0,
        execution: 70.0,
        bio: 55.0
      },
      gameState
    }));
    return;
  }
  
  // Route: GET /mmi/history/:playerId
  if (path.match(/^\/mmi\/history\/(\d+)$/)) {
    const playerId = path.match(/^\/mmi\/history\/(\d+)$/)[1];
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const history = db.moments
      .filter(m => m.player_id === playerId)
      .slice(0, limit);
    
    res.writeHead(200);
    res.end(JSON.stringify({ history }));
    return;
  }
  
  // Route: GET /mmi/top
  if (path === '/mmi/top' || path === '/mmi/top/') {
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const timeframe = parseInt(url.searchParams.get('timeframe') || '7');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);
    
    const topMoments = db.moments
      .filter(m => new Date(m.created_at) >= cutoffDate)
      .sort((a, b) => b.mmi_score - a.mmi_score)
      .slice(0, limit);
    
    res.writeHead(200);
    res.end(JSON.stringify({ topMoments }));
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 8787;
server.listen(PORT, () => {
  console.log(`🚀 MMI Dev Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET /mmi/games/today`);
  console.log(`  GET /mmi/:gameId`);
  console.log(`  GET /mmi/history/:playerId?limit=20`);
  console.log(`  GET /mmi/top?limit=10&timeframe=7`);
  console.log(`\nTest with: curl http://localhost:${PORT}/mmi/717715`);
});
