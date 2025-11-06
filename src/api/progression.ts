export interface ProgressionSnapshot {
  playerId: string;
  level: number;
  experience: number;
  unlockedBadges: string[];
  lastUpdated: string;
}

export async function fetchPlayerProgression(playerId: string): Promise<ProgressionSnapshot> {
  const response = await fetch(`/api/progress/${playerId}`);
  if (!response.ok) {
    throw new Error(`Failed to load progress for ${playerId}`);
  }
  return (await response.json()) as ProgressionSnapshot;
}
