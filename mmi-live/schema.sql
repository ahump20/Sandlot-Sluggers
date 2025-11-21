-- MMI (Moment Mentality Index) Database Schema
-- Cloudflare D1 Database for blazesportsintel.com

-- Main table: Store every MMI calculation moment
CREATE TABLE IF NOT EXISTS mmi_moments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Game context
    game_id TEXT NOT NULL,
    pitcher_id INTEGER NOT NULL,
    batter_id INTEGER NOT NULL,
    
    -- Situation
    inning INTEGER NOT NULL,
    inning_half TEXT NOT NULL CHECK(inning_half IN ('top', 'bottom')),
    outs INTEGER NOT NULL CHECK(outs BETWEEN 0 AND 2),
    count TEXT NOT NULL, -- "balls-strikes" e.g. "3-2"
    baserunners TEXT, -- "1B, 2B, 3B" or "Empty"
    score_diff INTEGER NOT NULL,
    
    -- MMI calculation
    mmi_score REAL NOT NULL CHECK(mmi_score BETWEEN 0 AND 100),
    category TEXT NOT NULL CHECK(category IN ('Elite Pressure', 'High Difficulty', 'Moderate', 'Routine')),
    
    -- Component breakdown (for analysis/debugging)
    leverage_index REAL NOT NULL,
    pressure REAL NOT NULL,
    fatigue REAL NOT NULL,
    execution REAL NOT NULL,
    bio REAL NOT NULL,
    
    -- Metadata
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for fast queries
    CONSTRAINT game_moment UNIQUE (game_id, pitcher_id, batter_id, inning, inning_half, count)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mmi_pitcher ON mmi_moments(pitcher_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_mmi_batter ON mmi_moments(batter_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_mmi_game ON mmi_moments(game_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_mmi_score ON mmi_moments(mmi_score DESC, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_mmi_date ON mmi_moments(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_mmi_category ON mmi_moments(category, mmi_score DESC);

-- Player streaks table (for tracking high-MMI performance)
CREATE TABLE IF NOT EXISTS player_streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('pitcher', 'batter')),
    
    -- Streak metrics
    high_mmi_games INTEGER DEFAULT 0, -- Games with MMI > 70
    avg_mmi REAL,
    max_mmi REAL,
    total_moments INTEGER DEFAULT 0,
    
    -- Time window
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT player_period UNIQUE (player_id, role, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_streak_player ON player_streaks(player_id, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_streak_avg ON player_streaks(avg_mmi DESC, period_end DESC);

-- Game summary table (aggregate MMI stats per game)
CREATE TABLE IF NOT EXISTS game_summary (
    game_id TEXT PRIMARY KEY,
    
    -- Aggregate MMI metrics
    avg_mmi REAL,
    max_mmi REAL,
    total_elite_moments INTEGER DEFAULT 0, -- MMI > 70
    total_high_moments INTEGER DEFAULT 0,  -- MMI 55-70
    total_moments INTEGER DEFAULT 0,
    
    -- Most clutch players
    top_pitcher_id INTEGER,
    top_pitcher_mmi REAL,
    top_batter_id INTEGER,
    top_batter_mmi REAL,
    
    -- Game metadata
    game_date DATE NOT NULL,
    home_team TEXT,
    away_team TEXT,
    final_score TEXT,
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_date ON game_summary(game_date DESC);
CREATE INDEX IF NOT EXISTS idx_game_avg_mmi ON game_summary(avg_mmi DESC);

-- Calibration table (for z-score parameter updates)
CREATE TABLE IF NOT EXISTS calibration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component TEXT NOT NULL CHECK(component IN ('leverageIndex', 'pressure', 'fatigue', 'execution', 'bio')),
    
    -- Statistical parameters
    mean REAL NOT NULL,
    std_dev REAL NOT NULL,
    
    -- Sample size used for calculation
    sample_size INTEGER NOT NULL,
    
    -- Time window for calibration
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    
    CONSTRAINT component_period UNIQUE (component, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_calibration_active ON calibration(component, is_active, calculated_at DESC);

-- Validation table (for predictive accuracy tracking)
CREATE TABLE IF NOT EXISTS validation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moment_id INTEGER NOT NULL,
    
    -- Predicted difficulty (MMI at time of calculation)
    predicted_mmi REAL NOT NULL,
    
    -- Actual outcome
    wpa_swing REAL, -- Win Probability Added (outcome impact)
    outcome_type TEXT, -- 'strikeout', 'walk', 'hit', 'out', etc.
    outcome_quality TEXT CHECK(outcome_quality IN ('positive', 'negative', 'neutral')),
    
    -- Metadata
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (moment_id) REFERENCES mmi_moments(id)
);

CREATE INDEX IF NOT EXISTS idx_validation_moment ON validation(moment_id);
CREATE INDEX IF NOT EXISTS idx_validation_mmi ON validation(predicted_mmi, wpa_swing);

-- Insert initial calibration values (league averages)
INSERT OR IGNORE INTO calibration (component, mean, std_dev, sample_size, period_start, period_end, is_active) VALUES
('leverageIndex', 1.0, 0.8, 1000, '2024-01-01', '2024-12-31', 1),
('pressure', 50.0, 25.0, 1000, '2024-01-01', '2024-12-31', 1),
('fatigue', 50.0, 20.0, 1000, '2024-01-01', '2024-12-31', 1),
('execution', 50.0, 15.0, 1000, '2024-01-01', '2024-12-31', 1),
('bio', 50.0, 10.0, 1000, '2024-01-01', '2024-12-31', 1);

-- View: Recent elite moments (for dashboard)
CREATE VIEW IF NOT EXISTS recent_elite_moments AS
SELECT 
    m.id,
    m.game_id,
    m.pitcher_id,
    m.batter_id,
    m.mmi_score,
    m.category,
    m.inning,
    m.inning_half,
    m.outs,
    m.count,
    m.baserunners,
    m.recorded_at
FROM mmi_moments m
WHERE m.mmi_score >= 70
ORDER BY m.recorded_at DESC
LIMIT 100;

-- View: Player MMI rankings (rolling 30 days)
CREATE VIEW IF NOT EXISTS player_mmi_rankings AS
SELECT 
    player_id,
    role,
    COUNT(*) as total_moments,
    ROUND(AVG(mmi_score), 2) as avg_mmi,
    ROUND(MAX(mmi_score), 2) as max_mmi,
    SUM(CASE WHEN mmi_score >= 70 THEN 1 ELSE 0 END) as elite_moments,
    SUM(CASE WHEN mmi_score >= 55 AND mmi_score < 70 THEN 1 ELSE 0 END) as high_moments
FROM (
    SELECT pitcher_id as player_id, 'pitcher' as role, mmi_score, recorded_at
    FROM mmi_moments
    WHERE DATE(recorded_at) >= DATE('now', '-30 days')
    UNION ALL
    SELECT batter_id as player_id, 'batter' as role, mmi_score, recorded_at
    FROM mmi_moments
    WHERE DATE(recorded_at) >= DATE('now', '-30 days')
)
GROUP BY player_id, role
HAVING total_moments >= 5
ORDER BY avg_mmi DESC;

-- Trigger: Update game_summary when new moment added
CREATE TRIGGER IF NOT EXISTS update_game_summary_on_insert
AFTER INSERT ON mmi_moments
BEGIN
    INSERT INTO game_summary (
        game_id, 
        avg_mmi, 
        max_mmi, 
        total_elite_moments, 
        total_high_moments,
        total_moments,
        game_date
    )
    VALUES (
        NEW.game_id,
        NEW.mmi_score,
        NEW.mmi_score,
        CASE WHEN NEW.mmi_score >= 70 THEN 1 ELSE 0 END,
        CASE WHEN NEW.mmi_score >= 55 AND NEW.mmi_score < 70 THEN 1 ELSE 0 END,
        1,
        DATE(NEW.recorded_at)
    )
    ON CONFLICT(game_id) DO UPDATE SET
        avg_mmi = (
            SELECT AVG(mmi_score) 
            FROM mmi_moments 
            WHERE game_id = NEW.game_id
        ),
        max_mmi = (
            SELECT MAX(mmi_score) 
            FROM mmi_moments 
            WHERE game_id = NEW.game_id
        ),
        total_elite_moments = (
            SELECT COUNT(*) 
            FROM mmi_moments 
            WHERE game_id = NEW.game_id AND mmi_score >= 70
        ),
        total_high_moments = (
            SELECT COUNT(*) 
            FROM mmi_moments 
            WHERE game_id = NEW.game_id AND mmi_score >= 55 AND mmi_score < 70
        ),
        total_moments = (
            SELECT COUNT(*) 
            FROM mmi_moments 
            WHERE game_id = NEW.game_id
        ),
        updated_at = CURRENT_TIMESTAMP;
END;

-- Materialized stats table (refreshed daily for performance)
CREATE TABLE IF NOT EXISTS daily_stats (
    stat_date DATE PRIMARY KEY,
    
    -- Daily aggregates
    total_moments INTEGER DEFAULT 0,
    avg_mmi REAL,
    total_elite_moments INTEGER DEFAULT 0,
    total_high_moments INTEGER DEFAULT 0,
    
    -- Top performers
    top_pitcher_id INTEGER,
    top_pitcher_avg_mmi REAL,
    top_batter_id INTEGER,
    top_batter_avg_mmi REAL,
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(stat_date DESC);

-- Analytics table (for long-term trend analysis)
CREATE TABLE IF NOT EXISTS analytics_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Time window
    snapshot_date DATE NOT NULL,
    window_days INTEGER NOT NULL, -- 7, 30, 90, 365
    
    -- Aggregate metrics
    total_moments INTEGER,
    avg_mmi REAL,
    median_mmi REAL,
    mmi_stddev REAL,
    
    -- Distribution
    elite_pct REAL, -- % of moments with MMI >= 70
    high_pct REAL,  -- % 55-70
    moderate_pct REAL, -- % 40-55
    routine_pct REAL, -- % 0-40
    
    -- Validation metrics (if available)
    avg_wpa_correlation REAL, -- Correlation between MMI and actual WPA
    prediction_accuracy REAL, -- % of high-MMI moments that resulted in high-WPA
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT snapshot_window UNIQUE (snapshot_date, window_days)
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshot(snapshot_date DESC, window_days);
