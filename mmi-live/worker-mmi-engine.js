/**
 * MMI (Moment Mentality Index) Calculation Engine
 * Cloudflare Worker for blazesportsintel.com
 * 
 * Formula: z(LI)·0.35 + z(Pressure)·0.20 + z(Fatigue)·0.20 + z(Execution)·0.15 + z(Bio)·0.10
 */

// MLB StatsAPI base URL
const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';

// MMI component weights
const WEIGHTS = {
  leverageIndex: 0.35,
  pressure: 0.20,
  fatigue: 0.20,
  execution: 0.15,
  bio: 0.10
};

// Statistical parameters for z-score normalization (season averages)
const NORMALIZATION_PARAMS = {
  leverageIndex: { mean: 1.0, stdDev: 0.8 },
  pressure: { mean: 50, stdDev: 25 },
  fatigue: { mean: 50, stdDev: 20 },
  execution: { mean: 50, stdDev: 15 },
  bio: { mean: 50, stdDev: 10 }
};

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle OPTIONS for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      if (path === '/mmi/games/today') {
        return await handleTodaysGames(env, corsHeaders);
      } else if (path.startsWith('/mmi/history/')) {
        const playerId = path.split('/')[3];
        const limit = parseInt(url.searchParams.get('limit') || '20');
        return await handlePlayerHistory(playerId, limit, env, corsHeaders);
      } else if (path.startsWith('/mmi/top')) {
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const timeframe = parseInt(url.searchParams.get('timeframe') || '7');
        return await handleTopMoments(limit, timeframe, env, corsHeaders);
      } else if (path.startsWith('/mmi/')) {
        const gameId = path.split('/')[2];
        return await handleMMICalculation(gameId, env, corsHeaders);
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

/**
 * Get today's live games from MLB API
 */
async function handleTodaysGames(env, corsHeaders) {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `games:${today}`;

  // Check KV cache
  const cached = await env.MMI_KV.get(cacheKey);
  if (cached) {
    return new Response(cached, { headers: corsHeaders });
  }

  // Fetch from MLB API
  const response = await fetch(`${MLB_API_BASE}/schedule?sportId=1&date=${today}`);
  const data = await response.json();

  const games = data.dates?.[0]?.games || [];
  const simplified = games.map(game => ({
    gameId: game.gamePk,
    status: game.status.abstractGameState,
    teams: {
      away: game.teams.away.team.name,
      home: game.teams.home.team.name
    },
    time: game.gameDate
  }));

  const result = JSON.stringify({ date: today, games: simplified });

  // Cache for 2 minutes
  await env.MMI_KV.put(cacheKey, result, { expirationTtl: 120 });

  return new Response(result, { headers: corsHeaders });
}

/**
 * Calculate MMI for a specific game moment
 */
async function handleMMICalculation(gameId, env, corsHeaders) {
  const cacheKey = `mmi:${gameId}`;

  // Check KV cache (5 min TTL for live calculations)
  const cached = await env.MMI_KV.get(cacheKey);
  if (cached) {
    return new Response(cached, { headers: corsHeaders });
  }

  // Fetch live game data from MLB API
  const response = await fetch(`${MLB_API_BASE}/game/${gameId}/feed/live`);
  if (!response.ok) {
    throw new Error(`MLB API error: ${response.status}`);
  }

  const gameData = await response.json();
  const liveData = gameData.liveData;
  const plays = liveData.plays;

  // Get current play situation
  const currentPlay = plays.currentPlay;
  if (!currentPlay) {
    return new Response(JSON.stringify({ error: 'No active play' }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // Extract situation variables
  const situation = {
    inning: liveData.linescore.currentInning,
    inningHalf: liveData.linescore.inningHalf,
    outs: currentPlay.count?.outs || 0,
    balls: currentPlay.count?.balls || 0,
    strikes: currentPlay.count?.strikes || 0,
    onFirst: currentPlay.matchup.postOnFirst !== undefined,
    onSecond: currentPlay.matchup.postOnSecond !== undefined,
    onThird: currentPlay.matchup.postOnThird !== undefined,
    homeScore: liveData.linescore.teams.home.runs,
    awayScore: liveData.linescore.teams.away.runs,
    pitcher: currentPlay.matchup.pitcher,
    batter: currentPlay.matchup.batter
  };

  // Get pitcher fatigue data
  const pitcherStats = await getPitcherStats(situation.pitcher.id, env);

  // Calculate MMI components
  const leverageIndex = calculateLeverageIndex(situation);
  const pressure = calculatePressure(situation, gameData);
  const fatigue = calculateFatigue(pitcherStats, situation);
  const execution = calculateExecution(currentPlay, situation);
  const bio = calculateBioProxies(currentPlay, gameData);

  // Normalize to z-scores
  const zScores = {
    leverageIndex: calculateZScore(leverageIndex, NORMALIZATION_PARAMS.leverageIndex),
    pressure: calculateZScore(pressure, NORMALIZATION_PARAMS.pressure),
    fatigue: calculateZScore(fatigue, NORMALIZATION_PARAMS.fatigue),
    execution: calculateZScore(execution, NORMALIZATION_PARAMS.execution),
    bio: calculateZScore(bio, NORMALIZATION_PARAMS.bio)
  };

  // Calculate final MMI (scale 0-100)
  const mmiRaw = (
    zScores.leverageIndex * WEIGHTS.leverageIndex +
    zScores.pressure * WEIGHTS.pressure +
    zScores.fatigue * WEIGHTS.fatigue +
    zScores.execution * WEIGHTS.execution +
    zScores.bio * WEIGHTS.bio
  );

  // Transform z-score to 0-100 scale (mean=50, stdDev=15)
  const mmi = Math.max(0, Math.min(100, 50 + (mmiRaw * 15)));

  // Prepare result object
  const result = {
    gameId,
    timestamp: new Date().toISOString(),
    mmi: Math.round(mmi * 10) / 10,
    category: getMmiCategory(mmi),
    components: {
      leverageIndex: { raw: leverageIndex, zScore: zScores.leverageIndex, weight: WEIGHTS.leverageIndex },
      pressure: { raw: pressure, zScore: zScores.pressure, weight: WEIGHTS.pressure },
      fatigue: { raw: fatigue, zScore: zScores.fatigue, weight: WEIGHTS.fatigue },
      execution: { raw: execution, zScore: zScores.execution, weight: WEIGHTS.execution },
      bio: { raw: bio, zScore: zScores.bio, weight: WEIGHTS.bio }
    },
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
      pitcher: {
        id: situation.pitcher.id,
        name: situation.pitcher.fullName
      },
      batter: {
        id: situation.batter.id,
        name: situation.batter.fullName
      }
    }
  };

  // Store to D1 database
  await storeMmiMoment(result, env);

  const resultJson = JSON.stringify(result, null, 2);

  // Cache for 5 minutes
  await env.MMI_KV.put(cacheKey, resultJson, { expirationTtl: 300 });

  return new Response(resultJson, { headers: corsHeaders });
}

/**
 * Calculate Leverage Index (game state importance)
 * Based on win probability swing potential
 */
function calculateLeverageIndex(situation) {
  const { inning, outs, onFirst, onSecond, onThird, homeScore, awayScore } = situation;

  // Base leverage by inning (increases late in game)
  let inningFactor = 1.0;
  if (inning >= 7) inningFactor = 1.5;
  if (inning >= 9) inningFactor = 2.0;
  if (inning > 9) inningFactor = 2.5; // Extra innings

  // Score differential factor (close games = higher leverage)
  const scoreDiff = Math.abs(homeScore - awayScore);
  let scoreFactor = 1.0;
  if (scoreDiff === 0) scoreFactor = 2.0;
  else if (scoreDiff === 1) scoreFactor = 1.7;
  else if (scoreDiff === 2) scoreFactor = 1.3;
  else if (scoreDiff >= 5) scoreFactor = 0.3;

  // Baserunner factor (more runners = higher leverage)
  const runnersOn = [onFirst, onSecond, onThird].filter(Boolean).length;
  let runnerFactor = 1.0;
  if (runnersOn === 0) runnerFactor = 0.8;
  else if (runnersOn === 1) runnerFactor = 1.2;
  else if (runnersOn === 2) runnerFactor = 1.6;
  else if (runnersOn === 3) runnerFactor = 2.0; // Bases loaded

  // Outs factor (2 outs = higher leverage)
  let outsFactor = 1.0;
  if (outs === 0) outsFactor = 0.9;
  else if (outs === 1) outsFactor = 1.1;
  else if (outs === 2) outsFactor = 1.4;

  // Combined leverage index
  return inningFactor * scoreFactor * runnerFactor * outsFactor;
}

/**
 * Calculate Pressure component (crowd/timeout proxies)
 */
function calculatePressure(situation, gameData) {
  const { inning, outs, balls, strikes } = situation;

  // Full count pressure
  const countPressure = (balls === 3 && strikes === 2) ? 80 : 40;

  // Late-inning pressure
  let inningPressure = 30;
  if (inning >= 7) inningPressure = 50;
  if (inning >= 9) inningPressure = 70;
  if (inning > 9) inningPressure = 85;

  // Two-out pressure
  const outsPressure = outs === 2 ? 70 : 40;

  // Average the pressure components
  return (countPressure + inningPressure + outsPressure) / 3;
}

/**
 * Calculate Fatigue component (pitch count + rest)
 */
function calculateFatigue(pitcherStats, situation) {
  const pitchCount = pitcherStats.pitchCount || 0;
  const daysSinceLastAppearance = pitcherStats.daysSinceLastAppearance || 3;

  // Pitch count fatigue (exponential after 80 pitches)
  let pitchFatigue = 30;
  if (pitchCount > 60) pitchFatigue = 40;
  if (pitchCount > 80) pitchFatigue = 60;
  if (pitchCount > 100) pitchFatigue = 80;
  if (pitchCount > 120) pitchFatigue = 95;

  // Rest fatigue (less rest = more fatigue)
  let restFatigue = 20;
  if (daysSinceLastAppearance === 0) restFatigue = 70;
  else if (daysSinceLastAppearance === 1) restFatigue = 50;
  else if (daysSinceLastAppearance === 2) restFatigue = 35;

  // Weighted average (pitch count matters more)
  return (pitchFatigue * 0.7) + (restFatigue * 0.3);
}

/**
 * Calculate Execution component (pitch difficulty)
 */
function calculateExecution(currentPlay, situation) {
  const { balls, strikes } = situation;

  // Count pressure
  let countDifficulty = 40;
  if (balls === 3 && strikes < 2) countDifficulty = 70; // 3-0, 3-1
  if (balls === 3 && strikes === 2) countDifficulty = 85; // Full count
  if (balls === 0 && strikes === 2) countDifficulty = 30; // Pitcher's count

  // Last pitch result (if available)
  const lastPitch = currentPlay.playEvents?.[currentPlay.playEvents.length - 1];
  let resultDifficulty = 50;
  if (lastPitch) {
    const result = lastPitch.details?.description || '';
    if (result.includes('Foul')) resultDifficulty = 60;
    if (result.includes('Ball')) resultDifficulty = 65;
    if (result.includes('Called Strike')) resultDifficulty = 40;
    if (result.includes('Swinging Strike')) resultDifficulty = 35;
  }

  return (countDifficulty * 0.6) + (resultDifficulty * 0.4);
}

/**
 * Calculate Bio-proxies (tempo, substitution patterns)
 */
function calculateBioProxies(currentPlay, gameData) {
  // Mound visits this game (proxy for struggle)
  const moundVisits = gameData.liveData.boxscore?.teams?.home?.pitchers?.length || 0;

  // Time between pitches (faster = less thinking/stress)
  let tempoPressure = 50;
  if (moundVisits > 2) tempoPressure = 70;
  if (moundVisits > 4) tempoPressure = 85;

  return tempoPressure;
}

/**
 * Get pitcher stats (pitch count, rest days)
 */
async function getPitcherStats(pitcherId, env) {
  try {
    // Check cache first
    const cacheKey = `pitcher:${pitcherId}`;
    const cached = await env.MMI_KV.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Fetch from MLB API
    const response = await fetch(`${MLB_API_BASE}/people/${pitcherId}/stats?stats=gameLog&group=pitching`);
    const data = await response.json();

    const recentGames = data.stats?.[0]?.splits || [];
    const lastGame = recentGames[0];

    const stats = {
      pitchCount: lastGame?.stat?.numberOfPitches || 0,
      daysSinceLastAppearance: calculateDaysSince(lastGame?.date),
      season: {
        era: lastGame?.stat?.era || 0,
        whip: lastGame?.stat?.whip || 0
      }
    };

    // Cache for 10 minutes
    await env.MMI_KV.put(cacheKey, JSON.stringify(stats), { expirationTtl: 600 });

    return stats;
  } catch (error) {
    console.error('Error fetching pitcher stats:', error);
    return { pitchCount: 0, daysSinceLastAppearance: 3 };
  }
}

/**
 * Calculate days since a date
 */
function calculateDaysSince(dateString) {
  if (!dateString) return 3; // Default
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate z-score for normalization
 */
function calculateZScore(value, params) {
  return (value - params.mean) / params.stdDev;
}

/**
 * Get MMI category label
 */
function getMmiCategory(mmi) {
  if (mmi >= 70) return 'Elite Pressure';
  if (mmi >= 55) return 'High Difficulty';
  if (mmi >= 40) return 'Moderate';
  return 'Routine';
}

/**
 * Store MMI moment to D1 database
 */
async function storeMmiMoment(result, env) {
  try {
    await env.MMI_DB.prepare(`
      INSERT INTO mmi_moments (
        game_id, pitcher_id, batter_id, inning, inning_half, outs, count,
        baserunners, score_diff, mmi_score, category, leverage_index,
        pressure, fatigue, execution, bio, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      result.gameId,
      result.players.pitcher.id,
      result.players.batter.id,
      result.situation.inning,
      result.situation.half,
      result.situation.outs,
      result.situation.count,
      result.situation.baserunners,
      Math.abs(parseInt(result.situation.score.split('-')[0]) - parseInt(result.situation.score.split('-')[1])),
      result.mmi,
      result.category,
      result.components.leverageIndex.raw,
      result.components.pressure.raw,
      result.components.fatigue.raw,
      result.components.execution.raw,
      result.components.bio.raw,
      result.timestamp
    ).run();
  } catch (error) {
    console.error('Error storing MMI moment:', error);
  }
}

/**
 * Get player MMI history
 */
async function handlePlayerHistory(playerId, limit, env, corsHeaders) {
  try {
    const results = await env.MMI_DB.prepare(`
      SELECT * FROM mmi_moments
      WHERE pitcher_id = ? OR batter_id = ?
      ORDER BY recorded_at DESC
      LIMIT ?
    `).bind(playerId, playerId, limit).all();

    return new Response(JSON.stringify({
      playerId,
      count: results.results.length,
      moments: results.results
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Error fetching player history:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

/**
 * Get top MMI moments (leaderboard)
 */
async function handleTopMoments(limit, timeframe, env, corsHeaders) {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - timeframe);

    const results = await env.MMI_DB.prepare(`
      SELECT * FROM mmi_moments
      WHERE recorded_at >= ?
      ORDER BY mmi_score DESC
      LIMIT ?
    `).bind(daysAgo.toISOString(), limit).all();

    return new Response(JSON.stringify({
      timeframe: `${timeframe} days`,
      count: results.results.length,
      moments: results.results
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Error fetching top moments:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
