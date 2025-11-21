import { GameEngine } from "./core/GameEngine";
import { ORIGINAL_CHARACTERS } from "./data/characters";
import { STADIUMS } from "./data/stadiums";
import { ProgressionAPI, PlayerProgress } from "./api/progression";
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
let playerProgress: PlayerProgress | null = null;
async function loadPlayerProgress(): Promise<void> {
  try {
    playerProgress = await progressionAPI.getProgress(currentPlayerId!);
    console.log("Player progress loaded:", playerProgress);
  } catch (error) {
    console.warn("Could not load player progress (creating new):", error);
    // Player doesn't exist yet, will be created on first game completion
  }
}

// Load progress on startup
void loadPlayerProgress();

// Select stadium (random or from progress)
const selectedStadium = STADIUMS[Math.floor(Math.random() * STADIUMS.length)];
console.log("Playing at:", selectedStadium.name);

// Track game stats for progression
let gameStats = {
  hitsRecorded: 0,
  homeRunsHit: 0,
  runsScored: 0
};

const game = new GameEngine({
  canvas,
  onGameStateChange: (state) => {
    updateUI(state);
    
    // Track stats for progression
    const totalRuns = state.homeScore + state.awayScore;
    if (totalRuns > gameStats.runsScored) {
      gameStats.runsScored = totalRuns;
    }
    
    // Check for game end (9 innings complete)
    if (state.inning > 9 && !state.isTopOfInning) {
      handleGameEnd(state);
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

// Handle game end and record stats
async function handleGameEnd(state: any): Promise<void> {
  const homeWon = state.homeScore > state.awayScore;
  
  try {
    await progressionAPI.recordGameResult(currentPlayerId!, {
      won: homeWon,
      runsScored: gameStats.runsScored,
      hitsRecorded: gameStats.hitsRecorded,
      homeRunsHit: gameStats.homeRunsHit
    });
    console.log("Game result recorded successfully");
  } catch (error) {
    console.error("Failed to record game result:", error);
  }
}

// Track home runs (called from UI or game events)
(window as any).recordHomeRun = () => {
  gameStats.homeRunsHit++;
};

(window as any).recordHit = () => {
  gameStats.hitsRecorded++;
};

// Load initial players
const randomPitcher = ORIGINAL_CHARACTERS.find(c => c.position === "P");
const randomBatter = ORIGINAL_CHARACTERS[0];

if (randomPitcher) {
  void game.loadPlayer(randomPitcher, new Vector3(0, 0, 18.44), "pitcher");
}
void game.loadPlayer(randomBatter, new Vector3(0, 0, 0), "batter");

// Display stadium info
console.log(`Stadium: ${selectedStadium.name} - ${selectedStadium.description}`);
console.log(`Dimensions: LF-${selectedStadium.dimensions.leftField}m, CF-${selectedStadium.dimensions.centerField}m, RF-${selectedStadium.dimensions.rightField}m`);
