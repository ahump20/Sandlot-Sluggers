CREATE TABLE IF NOT EXISTS analytics_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sport TEXT NOT NULL,
  metric TEXT NOT NULL,
  value TEXT NOT NULL,
  context TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_sport ON analytics_summary (sport);
