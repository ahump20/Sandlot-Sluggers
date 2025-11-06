const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8787";

export interface SportsSummaryEntry {
  sport: string;
  metric: string;
  value: string;
  context: string;
}

export interface SportsSummaryResponse {
  generatedAt: string;
  entries: SportsSummaryEntry[];
}

export interface SportsSummary {
  generatedAt: Date;
  entries: SportsSummaryEntry[];
}

export async function fetchSportsSummary(): Promise<SportsSummary> {
  try {
    const response = await fetch(`${API_BASE_URL}/sports/summary`, {
      headers: {
        Accept: "application/json"
      },
      next: {
        revalidate: 120
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sports summary: ${response.statusText}`);
    }

    const payload: SportsSummaryResponse = await response.json();

    return {
      generatedAt: new Date(payload.generatedAt),
      entries: payload.entries
    };
  } catch (error) {
    console.error(error);
    return {
      generatedAt: new Date(),
      entries: [
        {
          sport: "System",
          metric: "Offline Mode",
          value: "N/A",
          context: "Unable to reach the BlazeSportsIntel API. Falling back to static messaging."
        }
      ]
    };
  }
}
