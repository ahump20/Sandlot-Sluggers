import { GameEngine } from "./core/GameEngine";
import { getLineup } from "./data/characters";
import { getDefaultStadium } from "./data/stadiums";
import { fetchPlayerProgression } from "./api/progression";

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
  const status = document.getElementById("status-panel");

  if (!canvas || !status) {
    console.error("Missing required DOM elements");
    return;
  }

  const engine = await GameEngine.bootstrap(canvas);
  const stadium = getDefaultStadium();
  const lineup = getLineup();

  engine.loadStadium({ id: stadium.id, name: stadium.name, skylineColor: stadium.skylineColor });
  engine.spawnPlayers(
    lineup.map((player) => ({
      id: player.id,
      name: player.name,
      position: player.position,
      accentColor: player.accentColor
    }))
  );

  status.innerHTML = `
    <h2>${stadium.name}</h2>
    <p>${stadium.city} · Capacity ${stadium.capacity.toLocaleString()}</p>
    <p>Engine Mode: ${engine.getEngineMode().toUpperCase()}</p>
  `;

  try {
    const progression = await fetchPlayerProgression(lineup[0].id);
    const progressContainer = document.createElement("section");
    progressContainer.innerHTML = `
      <h3>${lineup[0].name} Progression</h3>
      <p>Level ${progression.level} • ${progression.experience.toLocaleString()} XP</p>
      <p>Badges: ${progression.unlockedBadges.join(", ") || "None"}</p>
      <small>Updated ${new Date(progression.lastUpdated).toLocaleString()}</small>
    `;
    status.appendChild(progressContainer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const errorBanner = document.createElement("p");
    errorBanner.textContent = `Unable to load player progression: ${message}`;
    errorBanner.setAttribute("role", "alert");
    status.appendChild(errorBanner);
  }

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch (error) {
      console.warn("Service worker registration failed", error);
    }
  }
});
