-- MMI (Moment Mentality Index) Database Schema
-- D1 SQLite database for storing MMI calculations and historical data

-- Main table for MMI moments
CREATE TABLE IF NOT EXISTS mmi_moments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  moment_type TEXT NOT NULL DEFAULT 'pitch', -- 'pitch', 'at_bat', 'defensive_play'
  mmi_score REAL NOT NULL,
  leverage_index REAL NOT NULL,
  pressure REAL NOT NULL,
  fatigue REAL NOT NULL,
  execution REAL NOT NULL,
  bio REAL NOT NULL,
  game_state TEXT NOT NULL, -- JSON string of game state
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Indexes for fast queries
  INDEX idx_game_id (game_id),
  INDEX idx_player_id (player_id),
  INDEX idx_created_at (created_at),
  INDEX idx_mmi_score (mmi_score),
  INDEX idx_game_player (game_id, player_id)
);

-- Player streak tracking
CREATE TABLE IF NOT EXISTS player_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  streak_type TEXT NOT NULL, -- 'high_mmi', 'clutch_performance', 'fatigue'
  streak_start TEXT NOT NULL,
  streak_end TEXT,
  streak_value REAL, -- Average MMI during streak, or streak count
  games_in_streak INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1, -- 1 = active, 0 = ended
  
  INDEX idx_player_streak (player_id, streak_type, is_active),
  INDEX idx_streak_start (streak_start)
);

-- Game summary for quick lookups
CREATE TABLE IF NOT EXISTS game_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL UNIQUE,
  game_date TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  final_score TEXT,
  total_mmi_moments INTEGER DEFAULT 0,
  max_mmi REAL,
  avg_mmi REAL,
  high_pressure_moments INTEGER DEFAULT 0, -- MMI > 70
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  INDEX idx_game_date (game_date),
  INDEX idx_max_mmi (max_mmi),
  INDEX idx_teams (home_team, away_team)
);

-- Calibration parameters (for updating z-score normalization)
CREATE TABLE IF NOT EXISTS calibration (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parameter_name TEXT NOT NULL UNIQUE,
  parameter_value TEXT NOT NULL, -- JSON string for complex values
  calibrated_date TEXT NOT NULL DEFAULT (datetime('now')),
  sample_size INTEGER DEFAULT 0,
  notes TEXT,
  
  INDEX idx_param_name (parameter_name)
);

-- Insert default calibration parameters
INSERT OR IGNORE INTO calibration (parameter_name, parameter_value, sample_size, notes) VALUES
  ('leverage_index', '{"mean": 1.0, "std": 0.8}', 0, 'Initial calibration from theoretical leverage index'),
  ('pressure', '{"mean": 50, "std": 25}', 0, 'Initial calibration from game state analysis'),
  ('fatigue', '{"mean": 50, "std": 20}', 0, 'Initial calibration from pitch count and rest data'),
  ('execution', '{"mean": 50, "std": 15}', 0, 'Initial calibration from pitch velocity and type'),
  ('bio', '{"mean": 50, "std": 15}', 0, 'Initial calibration from tempo and substitution patterns');

-- View for top moments (last 7 days)
CREATE VIEW IF NOT EXISTS top_moments_7d AS
SELECT 
  mm.id,
  mm.game_id,
  mm.player_id,
  mm.mmi_score,
  mm.leverage_index,
  mm.pressure,
  mm.fatigue,
  mm.execution,
  mm.bio,
  mm.created_at,
  gs.game_date,
  gs.home_team,
  gs.away_team
FROM mmi_moments mm
LEFT JOIN game_summary gs ON mm.game_id = gs.game_id
WHERE mm.created_at >= datetime('now', '-7 days')
ORDER BY mm.mmi_score DESC;

-- View for player MMI averages (last 30 days)
CREATE VIEW IF NOT EXISTS player_mmi_avg_30d AS
SELECT 
  player_id,
  COUNT(*) as moment_count,
  AVG(mmi_score) as avg_mmi,
  MAX(mmi_score) as max_mmi,
  MIN(mmi_score) as min_mmi,
  AVG(leverage_index) as avg_li,
  AVG(pressure) as avg_pressure,
  AVG(fatigue) as avg_fatigue
FROM mmi_moments
WHERE created_at >= datetime('now', '-30 days')
GROUP BY player_id
HAVING moment_count >= 5; -- Only players with 5+ moments

-- Trigger to update game_summary when new moments are added
CREATE TRIGGER IF NOT EXISTS update_game_summary
AFTER INSERT ON mmi_moments
BEGIN
  INSERT OR REPLACE INTO game_summary (
    game_id,
    game_date,
    home_team,
    away_team,
    total_mmi_moments,
    max_mmi,
    avg_mmi,
    high_pressure_moments,
    updated_at
  )
  SELECT 
    NEW.game_id,
    date(NEW.created_at) as game_date,
    'TBD' as home_team, -- Would need to fetch from API
    'TBD' as away_team, -- Would need to fetch from API
    COUNT(*) as total_mmi_moments,
    MAX(mmi_score) as max_mmi,
    AVG(mmi_score) as avg_mmi,
    SUM(CASE WHEN mmi_score > 70 THEN 1 ELSE 0 END) as high_pressure_moments,
    datetime('now') as updated_at
  FROM mmi_moments
  WHERE game_id = NEW.game_id;
END;
