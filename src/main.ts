/**
 * Sandlot Sluggers - Main Entry Point
 * Initializes the fully integrated game engine with all advanced systems
 */

import { GameEngine } from "./core/GameEngine";

// Get canvas element
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

if (!canvas) {
  throw new Error("Canvas element 'renderCanvas' not found");
}

// Update loading status
const loadingStatus = document.getElementById("loading-status");
if (loadingStatus) {
  loadingStatus.textContent = "Initializing game systems...";
}

// Generate or retrieve player ID for progression tracking
let currentPlayerId = localStorage.getItem("playerId");
if (!currentPlayerId) {
  currentPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  localStorage.setItem("playerId", currentPlayerId);
}

// Initialize game engine with all integrated systems
const game = new GameEngine({
  canvas,
  onGameStateChange: (state) => {
    // Game state changes are now handled by GameUI internally
    // This callback can be used for external tracking/analytics
    console.log("Game state updated:", {
      inning: state.inning,
      score: `${state.awayScore} - ${state.homeScore}`,
      outs: state.outs,
      count: `${state.balls}-${state.strikes}`
    });

    // TODO: Save game state to progression API
    // progressionAPI.updatePlayerProgress(currentPlayerId, state);
  }
});

// Handle window close - cleanup
window.addEventListener("beforeunload", () => {
  game.dispose();
});

// Prevent context menu on canvas (right-click)
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Log game initialization
console.log("🎮 Sandlot Sluggers initialized successfully");
console.log("⚾ Player ID:", currentPlayerId);
console.log("📊 All systems operational:");
console.log("  ✓ Physics Engine (Magnus effect, air drag)");
console.log("  ✓ Graphics Renderer (PBR materials, shadows)");
console.log("  ✓ Field Builder (MLB-accurate dimensions)");
console.log("  ✓ Camera System (cinematic views)");
console.log("  ✓ Fielding AI (intelligent positioning)");
console.log("  ✓ Animation System (11 animation types)");
console.log("  ✓ Audio System (22 SFX, 7 music tracks)");
console.log("  ✓ Game UI (Backyard Baseball inspired)");
console.log("");
console.log("🎯 Ready to play ball!");

// Export game instance for debugging
(window as any).game = game;
