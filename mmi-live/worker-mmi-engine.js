/**
 * MMI (Moment Mentality Index) Engine
 * Cloudflare Worker integrating MLB StatsAPI
 * Formula: z(LI)·0.35 + z(Pressure)·0.20 + z(Fatigue)·0.20 + z(Execution)·0.15 + z(Bio)·0.10
 */

const MLB_STATS_API_BASE = 'https://statsapi.mlb.com/api/v1';

// MMI Component Weights
const WEIGHTS = {
  leverageIndex: 0.35,
  pressure: 0.20,
  fatigue: 0.20,
  execution: 0.15,
  bio: 0.10
};

// Z-score normalization parameters (calibrated from historical data)
const Z_SCORE_PARAMS = {
  leverageIndex: { mean: 1.0, std: 0.8 },
  pressure: { mean: 50, std: 25 },
  fatigue: { mean: 50, std: 20 },
  execution: { mean: 50, std: 15 },
  bio: { mean: 50, std: 15 }
};

/**
 * Calculate z-score normalization
 */
function zScore(value, mean, std) {
  if (std === 0) return 0;
  return (value - mean) / std;
}

/**
 * Calculate Leverage Index from game state
 */
function calculateLeverageIndex(gameState) {
  const { inning, halfInning, outs, bases, scoreDiff, runners } = gameState;
  
  // Base leverage from inning and score
  let li = 1.0;
  
  // Late innings increase leverage
  if (inning >= 7) li *= 1.5;
  if (inning >= 9) li *= 1.8;
  
  // Close games increase leverage
  const absDiff = Math.abs(scoreDiff);
  if (absDiff <= 1) li *= 1.6;
  if (absDiff === 0) li *= 1.4;
  
  // Bases loaded increases leverage
  if (bases === 'loaded') li *= 2.0;
  else if (bases === 'scoring') li *= 1.5;
  
  // Two outs increases leverage
  if (outs === 2) li *= 1.3;
  
  // Full count increases leverage
  if (gameState.count === '3-2') li *= 1.4;
  
  return Math.min(li, 5.0); // Cap at 5.0
}

/**
 * Calculate Pressure component
 */
function calculatePressure(gameState, playContext) {
  let pressure = 50; // Base pressure
  
  // Crowd intensity proxy (timeout frequency, game importance)
  if (playContext.timeouts > 0) pressure += 15;
  if (playContext.gameImportance === 'high') pressure += 20;
  
  // Count pressure
  if (gameState.count === '3-2') pressure += 25;
  else if (gameState.count === '2-2') pressure += 15;
  else if (gameState.count === '0-2') pressure += 10;
  
  // Late innings
  if (gameState.inning >= 9) pressure += 20;
  else if (gameState.inning >= 7) pressure += 10;
  
  // Close score
  if (Math.abs(gameState.scoreDiff) <= 1) pressure += 15;
  
  return Math.min(pressure, 100);
}

/**
 * Calculate Fatigue component
 */
function calculateFatigue(pitcherData, gameContext) {
  let fatigue = 50; // Base fatigue
  
  // Pitch count fatigue
  const pitchCount = pitcherData.pitchCount || 0;
  if (pitchCount > 100) fatigue += 30;
  else if (pitchCount > 80) fatigue += 20;
  else if (pitchCount > 60) fatigue += 10;
  
  // Rest days
  const restDays = pitcherData.restDays || 0;
  if (restDays === 0) fatigue += 15;
  else if (restDays === 1) fatigue += 10;
  
  // Role workload (closer, setup, starter)
  if (pitcherData.role === 'closer') fatigue += 10;
  if (pitcherData.role === 'setup') fatigue += 5;
  
  // Inning workload
  if (gameContext.inning >= 8) fatigue += 10;
  
  return Math.min(fatigue, 100);
}

/**
 * Calculate Execution component
 */
function calculateExecution(pitchData, count) {
  let execution = 50; // Base execution
  
  // Pitch velocity (higher = harder to execute)
  const velocity = pitchData.velocity || 0;
  if (velocity > 95) execution += 20;
  else if (velocity > 90) execution += 10;
  
  // Pitch type difficulty
  const pitchType = pitchData.type || 'fastball';
  const difficultyMap = {
    'curveball': 15,
    'slider': 12,
    'changeup': 10,
    'splitter': 12,
    'fastball': 5,
    'cutter': 8
  };
  execution += difficultyMap[pitchType] || 5;
  
  // Count pressure on execution
  if (count === '3-2') execution += 15;
  else if (count === '2-2') execution += 10;
  
  return Math.min(execution, 100);
}

/**
 * Calculate Bio-proxy component
 */
function calculateBio(pitcherData, gameContext) {
  let bio = 50; // Base bio
  
  // Tempo (time between pitches as fatigue indicator)
  const avgTempo = pitcherData.avgTempo || 20;
  if (avgTempo > 25) bio += 15; // Slower = more fatigue
  else if (avgTempo > 22) bio += 10;
  
  // Substitution patterns
  if (gameContext.recentSubstitutions > 0) bio += 10;
  
  // Recent performance (struggling = higher mental load)
  if (pitcherData.recentERA > 5.0) bio += 10;
  
  return Math.min(bio, 100);
}

/**
 * Calculate MMI from all components
 */
function calculateMMI(gameState, pitcherData, pitchData, playContext) {
  // Calculate raw components
  const li = calculateLeverageIndex(gameState);
  const pressure = calculatePressure(gameState, playContext);
  const fatigue = calculateFatigue(pitcherData, gameContext);
  const execution = calculateExecution(pitchData, gameState.count);
  const bio = calculateBio(pitcherData, gameContext);
  
  // Normalize to z-scores
  const zLI = zScore(li, Z_SCORE_PARAMS.leverageIndex.mean, Z_SCORE_PARAMS.leverageIndex.std);
  const zPressure = zScore(pressure, Z_SCORE_PARAMS.pressure.mean, Z_SCORE_PARAMS.pressure.std);
  const zFatigue = zScore(fatigue, Z_SCORE_PARAMS.fatigue.mean, Z_SCORE_PARAMS.fatigue.std);
  const zExecution = zScore(execution, Z_SCORE_PARAMS.execution.mean, Z_SCORE_PARAMS.execution.std);
  const zBio = zScore(bio, Z_SCORE_PARAMS.bio.mean, Z_SCORE_PARAMS.bio.std);
  
  // Weighted sum
  const mmi = (zLI * WEIGHTS.leverageIndex +
               zPressure * WEIGHTS.pressure +
               zFatigue * WEIGHTS.fatigue +
               zExecution * WEIGHTS.execution +
               zBio * WEIGHTS.bio) * 10 + 50; // Scale to 0-100
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, mmi));
}

/**
 * Fetch game data from MLB StatsAPI
 */
async function fetchGameData(gameId) {
  try {
    const response = await fetch(`${MLB_STATS_API_BASE}/game/${gameId}/boxscore`);
    if (!response.ok) throw new Error(`MLB API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching game data:', error);
    throw error;
  }
}

/**
 * Fetch live play-by-play data
 */
async function fetchPlayByPlay(gameId) {
  try {
    const response = await fetch(`${MLB_STATS_API_BASE}/game/${gameId}/playByPlay`);
    if (!response.ok) throw new Error(`MLB API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching play-by-play:', error);
    throw error;
  }
}

/**
 * Extract game state from MLB API response
 */
function extractGameState(gameData, playByPlay) {
  const currentPlay = playByPlay?.allPlays?.[playByPlay.allPlays.length - 1];
  const gameInfo = gameData?.gameData?.game || {};
  const linescore = gameData?.liveData?.linescore || {};
  
  return {
    inning: linescore.currentInning || 1,
    halfInning: linescore.inningHalf || 'top',
    outs: currentPlay?.count?.outs || 0,
    bases: getBasesState(currentPlay),
    scoreDiff: (linescore.away?.runs || 0) - (linescore.home?.runs || 0),
    count: currentPlay?.count ? `${currentPlay.count.balls}-${currentPlay.count.strikes}` : '0-0',
    runners: currentPlay?.runners || []
  };
}

/**
 * Get bases state from play data
 */
function getBasesState(play) {
  if (!play?.runners) return 'empty';
  const onBase = play.runners.filter(r => r.details?.isScoringEvent === false).length;
  if (onBase === 3) return 'loaded';
  if (onBase >= 1) return 'scoring';
  return 'empty';
}

/**
 * Extract pitcher data from game data
 */
function extractPitcherData(gameData, pitcherId) {
  const pitchers = gameData?.liveData?.boxscore?.teams?.away?.pitchers || 
                   gameData?.liveData?.boxscore?.teams?.home?.pitchers || [];
  const pitcher = pitchers.find(p => p.person?.id === pitcherId);
  
  return {
    pitchCount: pitcher?.pitchCount || 0,
    restDays: pitcher?.restDays || 0,
    role: pitcher?.role || 'starter',
    avgTempo: pitcher?.avgTempo || 20,
    recentERA: pitcher?.recentERA || 4.0
  };
}

/**
 * Extract pitch data from play
 */
function extractPitchData(play) {
  const pitch = play?.pitchData || {};
  return {
    velocity: pitch.startSpeed || 0,
    type: pitch.type?.code || 'fastball'
  };
}

/**
 * Main Worker handler
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Route: GET /mmi/games/today
      if (path === '/mmi/games/today' || path === '/mmi/games/today/') {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${MLB_STATS_API_BASE}/schedule?sportId=1&date=${today}`);
        const data = await response.json();
        
        const games = data.dates?.[0]?.games || [];
        return new Response(JSON.stringify({ games }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Route: GET /mmi/:gameId
      if (path.match(/^\/mmi\/(\d+)$/)) {
        const gameId = path.match(/^\/mmi\/(\d+)$/)[1];
        
        // Fetch game data
        const gameData = await fetchGameData(gameId);
        const playByPlay = await fetchPlayByPlay(gameId);
        
        // Extract current state
        const gameState = extractGameState(gameData, playByPlay);
        const currentPlay = playByPlay?.allPlays?.[playByPlay.allPlays.length - 1];
        const pitcherId = currentPlay?.matchup?.pitcher?.id;
        
        if (!pitcherId) {
          return new Response(JSON.stringify({ error: 'No active pitcher' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const pitcherData = extractPitcherData(gameData, pitcherId);
        const pitchData = extractPitchData(currentPlay);
        const playContext = {
          timeouts: 0, // Would need additional API call
          gameImportance: Math.abs(gameState.scoreDiff) <= 2 ? 'high' : 'normal',
          recentSubstitutions: 0 // Would need additional API call
        };
        
        // Calculate MMI
        const mmi = calculateMMI(gameState, pitcherData, pitchData, playContext);
        
        // Store in D1
        const timestamp = new Date().toISOString();
        await env.DB.prepare(`
          INSERT INTO mmi_moments (
            game_id, player_id, moment_type, mmi_score,
            leverage_index, pressure, fatigue, execution, bio,
            game_state, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          gameId,
          pitcherId,
          'pitch',
          mmi,
          calculateLeverageIndex(gameState),
          calculatePressure(gameState, playContext),
          calculateFatigue(pitcherData, playContext),
          calculateExecution(pitchData, gameState.count),
          calculateBio(pitcherData, playContext),
          JSON.stringify(gameState),
          timestamp
        ).run();
        
        // Cache in KV (5 min TTL)
        await env.KV.put(`mmi:${gameId}:latest`, JSON.stringify({
          mmi,
          timestamp,
          gameState,
          components: {
            leverageIndex: calculateLeverageIndex(gameState),
            pressure: calculatePressure(gameState, playContext),
            fatigue: calculateFatigue(pitcherData, playContext),
            execution: calculateExecution(pitchData, gameState.count),
            bio: calculateBio(pitcherData, playContext)
          }
        }), { expirationTtl: 300 });
        
        return new Response(JSON.stringify({
          gameId,
          playerId: pitcherId,
          mmi: Math.round(mmi * 10) / 10,
          timestamp,
          components: {
            leverageIndex: Math.round(calculateLeverageIndex(gameState) * 10) / 10,
            pressure: Math.round(calculatePressure(gameState, playContext) * 10) / 10,
            fatigue: Math.round(calculateFatigue(pitcherData, playContext) * 10) / 10,
            execution: Math.round(calculateExecution(pitchData, gameState.count) * 10) / 10,
            bio: Math.round(calculateBio(pitcherData, playContext) * 10) / 10
          },
          gameState
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Route: GET /mmi/history/:playerId
      if (path.match(/^\/mmi\/history\/(\d+)$/)) {
        const playerId = path.match(/^\/mmi\/history\/(\d+)$/)[1];
        const limit = parseInt(url.searchParams.get('limit') || '20');
        
        const result = await env.DB.prepare(`
          SELECT * FROM mmi_moments
          WHERE player_id = ?
          ORDER BY created_at DESC
          LIMIT ?
        `).bind(playerId, limit).all();
        
        return new Response(JSON.stringify({ history: result.results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Route: GET /mmi/top
      if (path === '/mmi/top' || path === '/mmi/top/') {
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const timeframe = parseInt(url.searchParams.get('timeframe') || '7');
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeframe);
        
        const result = await env.DB.prepare(`
          SELECT * FROM mmi_moments
          WHERE created_at >= ?
          ORDER BY mmi_score DESC
          LIMIT ?
        `).bind(cutoffDate.toISOString(), limit).all();
        
        return new Response(JSON.stringify({ topMoments: result.results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
