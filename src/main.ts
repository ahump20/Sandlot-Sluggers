import { GameEngine, type GameState } from "./core/GameEngine";
import { ORIGINAL_CHARACTERS } from "./data/characters";
import { ProgressionAPI, type PlayerProgress } from "./api/progression";
import { Vector3 } from "@babylonjs/core";

const canvas = document.getElementById("renderCanvas");
if (!canvas) {
  throw new Error("Game canvas not found");
}

const progressionAPI = new ProgressionAPI();

// Generate or retrieve player ID for progression tracking
let currentPlayerId = localStorage.getItem("playerId");
if (!currentPlayerId) {
  currentPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  localStorage.setItem("playerId", currentPlayerId);
}

// UI initialization
const scoreDisplay = document.getElementById("score");
const inningDisplay = document.getElementById("inning");
const countDisplay = document.getElementById("count");
const basesDisplay = document.getElementById("bases");
const pitchButton = document.getElementById("pitchButton");
const playerProgressDisplay = document.getElementById("playerProgress");

function updateUI(state: GameState): void {
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
    const baseStatus = state.bases
      .map((occupied: boolean, i: number) => (occupied ? `${i + 1}B` : ""))
      .filter(Boolean)
      .join(", ");
    basesDisplay.textContent = baseStatus || "Bases Empty";
  }
}

function updateProgressUI(progress: PlayerProgress): void {
  if (!playerProgressDisplay) return;
  const unlocks = progress.unlockedCharacters.length + progress.unlockedStadiums.length;
  playerProgressDisplay.textContent = `Level ${progress.currentLevel} • ${progress.experience} XP • ${unlocks} unlocks`;
}

async function refreshProgress(): Promise<void> {
  if (!currentPlayerId) return;
  try {
    const progress = await progressionAPI.getProgress(currentPlayerId);
    updateProgressUI(progress);
  } catch (error) {
    console.error("Failed to load player progress", error);
  }
}

async function bootstrap(): Promise<void> {
  const game = await GameEngine.create({
    canvas: canvas as HTMLCanvasElement,
    onGameStateChange: (state) => {
      updateUI(state);
    }
  });

  updateUI(game.getGameState());

  pitchButton?.addEventListener("click", () => {
    game.startPitch();
  });

  const randomPitcher = ORIGINAL_CHARACTERS.find(c => c.position === "P");
  const randomBatter = ORIGINAL_CHARACTERS[0];

  if (randomPitcher) {
    await game.loadPlayer(randomPitcher, new Vector3(0, 0, 9), "pitcher");
  }
  await game.loadPlayer(randomBatter, new Vector3(0, 0, 0), "batter");

  await refreshProgress();
}

bootstrap().catch((error) => {
  console.error("Game initialization failed", error);
  // Optionally, display a user-friendly message in the UI
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  });
}
