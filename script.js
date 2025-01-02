import GameState from './backend/gameState.js';
import { Difficulty, CPUPlayer } from './backend/cpuPlayer.js';
import { loadWordDataset } from './backend/wordDataset.js';

document.getElementById('startGameInit').addEventListener('click', showSetup);
document.getElementById('startGameSetupDone').addEventListener('click', startGame);
document.getElementById('addCPUPlayer').addEventListener('click', addCpuPlayer);
document.getElementById('submitMove').addEventListener('click', submitMove);

let gameState;

function hideAllScreens() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
      screen.style.display = 'none';
  });
}

function showSetup() {
  hideAllScreens();
  document.getElementById('settings').style.display = 'block';
}

let players = [{ name: "You", type: "Human", difficulty: null }]; 

function getPlayerElement(playerName, isCpu) {
  const playerDiv = document.createElement('div');
  playerDiv.classList.add('player-row');

  const playerNameDiv = document.createElement('span');
  playerNameDiv.classList.add('player-name');
  playerDiv.textContent = playerName;

  if (isCpu) {
    const difficultySelect = document.createElement('select');
    Object.values(Difficulty).forEach(difficulty => {
      const option = document.createElement('option');
      option.value = difficulty;
      option.innerText = difficulty;
      if (player.difficulty === difficulty) 
        option.selected = true;
      difficultySelect.appendChild(option);
    });

    difficultySelect.addEventListener('change', (e) => {
        players[index + 1].difficulty = e.target.value;
    });

  }

  return playerDiv;
}

function renderPlayers() {
  const playerListDiv = document.getElementById('player-list');
  playerListDiv.innerHTML = '';

  // Render the "You" player (cannot be removed)
  youPlayerDiv = getPlayerElement("You", /*isCPU=*/false);
  playerListDiv.addChild(youPlayerDiv);

  // Render the CPU players
  players.slice(1).forEach((player, index) => {
      const playerDiv = document.createElement('div');
      playerDiv.classList.add('player');

      const nameSpan = document.createElement('span');
      nameSpan.innerText = player.name;

      const difficultySelect = document.createElement('select');
      Object.values(Difficulty).forEach(difficulty => {
          const option = document.createElement('option');
          option.value = difficulty;
          option.innerText = difficulty;
          if (player.difficulty === difficulty) option.selected = true;
          difficultySelect.appendChild(option);
      });

      difficultySelect.addEventListener('change', (e) => {
          players[index + 1].difficulty = e.target.value;
      });

      const removeButton = document.createElement('button');
      removeButton.innerText = 'Remove';
      removeButton.addEventListener('click', () => {
          removePlayer(index + 1);  // Remove the player from the list (index starts from 1)
      });

      // Append elements to the player div
      playerDiv.appendChild(nameSpan);
      playerDiv.appendChild(difficultySelect);
      playerDiv.appendChild(removeButton);

      playerListDiv.appendChild(playerDiv);
  });
}

// Function to add a new CPU player
function addCpuPlayer() {
  if (players.length >= 9) {
      alert("Cannot add more than 8 players.");
      return;
  }

  const newPlayer = {
      name: `CPU ${players.length}`,
      type: "CPU",
      difficulty: Difficulty.EASY  // Default difficulty for new CPU
  };

  players.push(newPlayer);
  renderPlayers();
}

// Function to remove a player
function removePlayer(index) {
  if (index === 0) return;  // Cannot remove "You" (index 0)

  players.splice(index, 1);
  renderPlayers();
}

function startGame() {
  const cpuCount = parseInt(document.getElementById('cpuCount').value, 10);
  const players = [new CPUPlayer('easy'), ...Array(cpuCount).fill(new CPUPlayer('easy'))];
  const wordDataset = loadWordDataset();

  gameState = new GameState(players, wordDataset);

  hideAllScreens();
  document.getElementById('game').style.display = 'block';
}

function submitMove() {
  const userInput = document.getElementById('userInput').value;
  const currentPlayer = gameState.getCurrentPlayer();

  if (typeof currentPlayer.takeTurn === 'function') {
    const move = currentPlayer.takeTurn(gameState.currentString, gameState.wordDataset);
    // Apply move logic here
  }
}


document.addEventListener("DOMContentLoaded", () => {
  renderPlayers();
});