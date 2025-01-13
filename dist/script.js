import { GameState } from "./gameState.js";
import { GameOrchestrator } from "./gameOrchestrator.js";
import { SettingsOrchestrator } from "./settingsOrchestrator.js";
import { loadWordDataset } from "./util/loadWordset.js";
document
    .getElementById("menuStartGameBtn")
    ?.addEventListener("click", moveToSettings);
document
    .getElementById("settingsStartGameBtn")
    ?.addEventListener("click", moveToGame);
let gameState;
let settingsOrchestrator;
let gameOrchestrator;
function hideAllScreens() {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
        screen.style.display = "none";
    });
}
async function moveToSettings() {
    const button = document.getElementById("menuStartGameBtn");
    button.disabled = true;
    const wordSet = await loadWordDataset();
    gameState = new GameState(wordSet);
    settingsOrchestrator = new SettingsOrchestrator();
    settingsOrchestrator.setupStart();
    hideAllScreens();
    const settingsScreen = document.getElementById("settingsScreen");
    settingsScreen.style.display = "block";
}
async function moveToGame() {
    await settingsOrchestrator.setupComplete(gameState);
    gameOrchestrator = new GameOrchestrator(gameState);
    gameOrchestrator.startGame();
    hideAllScreens();
    const gameScreen = document.getElementById("gameScreen");
    gameScreen.style.display = "block";
}
