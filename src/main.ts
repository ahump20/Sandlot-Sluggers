import { GameEngine } from "./core/GameEngine";
import { ORIGINAL_CHARACTERS } from "./data/characters";
import { STADIUMS } from "./data/stadiums";
import { ProgressionAPI } from "./api/progression";
import { Vector3 } from "@babylonjs/core";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const progressionAPI = new ProgressionAPI();

// Generate or retrieve player ID for progression tracking
let currentPlayerId = localStorage.getItem("playerId");
if (!currentPlayerId) {
  currentPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  localStorage.setItem("playerId", currentPlayerId);
}

// Load player progress
let playerProgress: any = null;
progressionAPI.getProgress(currentPlayerId).then(progress => {
  playerProgress = progress;
  console.log("Loaded player progress:", progress);
}).catch(err => {
  console.warn("Could not load player progress (API may not be available):", err);
  // Continue without progression tracking
});

// Stadium selection (default to first stadium)
const selectedStadium = STADIUMS[0];

const game = new GameEngine({
  canvas,
  stadium: selectedStadium,
  onGameStateChange: (state) => {
    updateUI(state);
    
    // Track game statistics for progression (throttled to avoid excessive API calls)
    if (playerProgress) {
      const stats = game.getGameStats();
      // Update progress periodically (not on every state change for performance)
      if (stats.hits > 0 || stats.runs > 0) {
        // Debounce: only update every 5 seconds
        const lastUpdate = (window as any).lastProgressUpdate || 0;
        const now = Date.now();
        if (now - lastUpdate > 5000) {
          (window as any).lastProgressUpdate = now;
          progressionAPI.recordGameResult(currentPlayerId, {
            won: false, // TODO: Determine win/loss based on game completion
            runsScored: stats.runs,
            hitsRecorded: stats.hits,
            homeRunsHit: stats.homeRuns
          }).catch(err => console.warn("Failed to record game result:", err));
        }
      }
    }
  }
});

// UI initialization
const scoreDisplay = document.getElementById("score");
const inningDisplay = document.getElementById("inning");
const countDisplay = document.getElementById("count");
const basesDisplay = document.getElementById("bases");
const pitchButton = document.getElementById("pitchButton");

function updateUI(state: any) {
  if (scoreDisplay) {
    scoreDisplay.textContent = `${state.awayScore} - ${state.homeScore}`;
  }
  if (inningDisplay) {
    inningDisplay.textContent = `Inning: ${state.inning} ${state.isTopOfInning ? "Top" : "Bot"}`;
  }
  if (countDisplay) {
    countDisplay.textContent = `${state.balls}-${state.strikes}, ${state.outs} Outs`;
  }
  if (basesDisplay) {
    const baseStatus = state.bases.map((occupied: boolean, i: number) =>
      occupied ? `${i + 1}B` : ""
    ).filter(Boolean).join(", ");
    basesDisplay.textContent = baseStatus || "Bases Empty";
  }
}

pitchButton?.addEventListener("click", () => {
  game.startPitch();
});

// Load initial players
const randomPitcher = ORIGINAL_CHARACTERS.find(c => c.position === "P");
const randomBatter = ORIGINAL_CHARACTERS[0];

if (randomPitcher) {
  game.loadPlayer(randomPitcher, new Vector3(0, 0, 9), "pitcher");
}
game.loadPlayer(randomBatter, new Vector3(0, 0, 0), "batter");
