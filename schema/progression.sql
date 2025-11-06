CREATE TABLE IF NOT EXISTS player_progress (
  player_id TEXT PRIMARY KEY,
  level INTEGER NOT NULL,
  experience INTEGER NOT NULL,
  unlocked_badges TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR REPLACE INTO player_progress (player_id, level, experience, unlocked_badges, updated_at)
VALUES
  ('ace-pitch', 12, 18450, 'Ace Pilot,Heat Seeker', datetime('now')),
  ('sky-short', 15, 22010, 'Flash Freeze,Double Playmaker', datetime('now')),
  ('crush-left', 11, 16780, 'Wall Crusher,Gap Hunter', datetime('now'));
