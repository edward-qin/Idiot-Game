import { GameState } from "./gameState.js";
import { GameOrchestrator } from "./gameOrchestrator.js";
import { SettingsOrchestrator } from "./settingsOrchestrator.js";
import { loadWordDataset } from "./util/loadWordset.js"; 

document.getElementById('menuStartGameBtn')?.addEventListener('click', moveToSettings);
document.getElementById('settingsStartGameBtn')?.addEventListener('click', moveToGame);

let gameState: GameState;
let settingsOrchestrator: SettingsOrchestrator;
let gameOrchestrator: GameOrchestrator;

function hideAllScreens() {
  const screens = document.querySelectorAll('.screen') as NodeListOf<HTMLDivElement>;
  screens.forEach(screen => {
      screen.style.display = 'none';
  });
}

async function moveToSettings() {
  const wordSet = await loadWordDataset();
  gameState = new GameState(wordSet);
  settingsOrchestrator = new SettingsOrchestrator();
  settingsOrchestrator.setupStart();

  hideAllScreens();
  const settingsScreen = document.getElementById('settingsScreen') as HTMLDivElement;
  settingsScreen.style.display = 'block';
}

function moveToGame() {
  settingsOrchestrator.setupComplete(gameState);
  gameOrchestrator = new GameOrchestrator(gameState);
  gameOrchestrator.startGame();
  hideAllScreens();
  const gameScreen = document.getElementById('gameScreen') as HTMLDivElement;
  gameScreen.style.display = 'block';
}
