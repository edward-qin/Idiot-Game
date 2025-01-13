import { CPUPlayer } from "./player/cpuPlayer.js";
import { HumanPlayer } from "./player/humanPlayer.js";
import { Difficulty } from "./types/difficulty.js";
export class SettingsOrchestrator {
    players = [
        { name: "You" },
        { name: "CPU 1", cpuNumber: 1, difficulty: Difficulty.EASY },
    ];
    availableCpus = [2, 3, 4, 5];
    playerLock = new AsyncLock();
    setupStart() {
        const instructionsBtn = document.getElementById("instructions-button");
        instructionsBtn.addEventListener("click", function () {
            const instructionsText = document.getElementById("instructions-text");
            instructionsText.classList.toggle("hidden");
            if (instructionsText.classList.contains("hidden")) {
                this.textContent = "Show Instructions";
            }
            else {
                this.textContent = "Hide Instructions";
            }
        });
        this.renderPlayers();
    }
    async setupComplete(gameState) {
        await this.playerLock.acquire();
        return this.players.map((player) => {
            const playerObj = player.cpuNumber === undefined
                ? new HumanPlayer(player.name)
                : new CPUPlayer(player.name, gameState, player.difficulty);
            gameState.addPlayer(playerObj);
            return playerObj;
        });
    }
    async addCpuPlayer() {
        await this.playerLock.acquire();
        try {
            if (this.availableCpus.length === 0) {
                return;
            }
            this.disablePlayerButtons();
            const cpuNumber = this.availableCpus.shift();
            const newPlayer = {
                name: `CPU ${cpuNumber}`,
                cpuNumber: cpuNumber,
                difficulty: Difficulty.EASY, // Default difficulty for new CPU
            };
            this.players.push(newPlayer);
            this.renderPlayers();
        }
        finally {
            this.playerLock.release();
        }
    }
    async removePlayer(index) {
        await this.playerLock.acquire();
        try {
            if (this.players.length === 2) {
                return;
            }
            this.disablePlayerButtons();
            const removedPlayer = this.players[index];
            if (removedPlayer.cpuNumber === undefined) {
                throw new Error("This state should never be reached: invalid player number");
            }
            const playerNum = removedPlayer.cpuNumber;
            // Remove CPU player and add as available CPU number
            this.players.splice(index, 1);
            let i = 0;
            while (i < this.availableCpus.length) {
                if (this.availableCpus[i] > playerNum) {
                    this.availableCpus.splice(i, 0, playerNum);
                    break;
                }
                i++;
            }
            if (i === this.availableCpus.length) {
                this.availableCpus.push(playerNum);
            }
            this.renderPlayers();
        }
        finally {
            this.playerLock.release();
        }
    }
    async moveRow(index, direction) {
        await this.playerLock.acquire();
        try {
            const newPlayers = [...this.players];
            const currentPlayer = newPlayers[index];
            if (direction === "up" && index > 0) {
                newPlayers[index] = newPlayers[index - 1];
                newPlayers[index - 1] = currentPlayer;
            }
            else if (direction === "down" && index < newPlayers.length - 1) {
                newPlayers[index] = newPlayers[index + 1];
                newPlayers[index + 1] = currentPlayer;
            }
            this.players = [...newPlayers];
            this.renderPlayers();
        }
        finally {
            this.playerLock.release();
        }
    }
    disablePlayerButtons() {
        const addButton = document.getElementById("add-player");
        addButton.disabled = true;
        const removeButtons = document.querySelectorAll(".removePlayerButton");
        removeButtons.forEach((button) => {
            button.disabled = true;
        });
        const moveUpButtons = document.querySelectorAll(".move-up");
        moveUpButtons.forEach((button) => {
            button.disabled = true;
        });
        const moveDownButtons = document.querySelectorAll(".move-down");
        moveDownButtons.forEach((button) => {
            button.disabled = true;
        });
    }
    renderPlayers() {
        const playerListDiv = document.getElementById("settingsPlayerList");
        playerListDiv.innerHTML = "";
        // Render the CPU players
        this.players.forEach((player, index) => {
            const playerDiv = document.createElement("div");
            playerDiv.classList.add("player");
            // Add options to rearrange the players
            const moveUpButton = document.createElement("button");
            moveUpButton.className = "move-up";
            moveUpButton.textContent = "↑";
            moveUpButton.addEventListener("click", () => this.moveRow(index, "up"));
            if (index === 0) {
                moveUpButton.disabled = true;
            }
            playerDiv.appendChild(moveUpButton);
            const moveDownButton = document.createElement("button");
            moveDownButton.className = "move-down";
            moveDownButton.textContent = "↓";
            moveDownButton.addEventListener("click", () => this.moveRow(index, "down"));
            if (index === this.players.length - 1) {
                moveDownButton.disabled = true;
            }
            playerDiv.appendChild(moveDownButton);
            const nameSpan = document.createElement("span");
            nameSpan.innerText = player.name;
            nameSpan.className = "player-name";
            playerDiv.appendChild(nameSpan);
            // Add difficulty dropdown for CPU players
            if (player.cpuNumber !== undefined) {
                const difficultySelect = document.createElement("select");
                Object.values(Difficulty).forEach((difficulty) => {
                    const option = document.createElement("option");
                    option.value = difficulty;
                    option.innerText = difficulty;
                    if (player.difficulty === difficulty)
                        option.selected = true;
                    difficultySelect.appendChild(option);
                });
                difficultySelect.className = "difficulty";
                difficultySelect.addEventListener("change", (e) => {
                    const target = e.target;
                    this.players[index].difficulty = target.value;
                });
                playerDiv.appendChild(difficultySelect);
            }
            // Enable remove option for CPU players when there are at least 2 CPU players
            if (player.cpuNumber !== undefined) {
                const removeButton = document.createElement("button");
                removeButton.innerText = "Remove";
                removeButton.className = "remove-player";
                if (this.players.length >= 3) {
                    removeButton.addEventListener("click", () => {
                        this.removePlayer(index);
                    });
                    removeButton.disabled = false;
                }
                else {
                    removeButton.disabled = true;
                }
                playerDiv.appendChild(removeButton);
            }
            else {
                // Placeholder for styling for Human Player
                const removePlaceholder = document.createElement("span");
                playerDiv.appendChild(removePlaceholder);
            }
            playerListDiv.appendChild(playerDiv);
        });
        // Render Add Player Button
        const addPlayerRow = document.createElement("div");
        addPlayerRow.className = "add-player-row";
        const addPlayerButton = document.createElement("button");
        addPlayerButton.id = "add-player";
        addPlayerButton.textContent = "+ Add CPU Player";
        addPlayerButton.addEventListener("click", () => this.addCpuPlayer());
        addPlayerButton.disabled = this.players.length === 6;
        addPlayerRow.appendChild(addPlayerButton);
        playerListDiv.appendChild(addPlayerRow);
    }
}
class AsyncLock {
    lockPromise = null;
    resolveLock = null;
    async acquire() {
        // If there’s an active lock, wait for it
        while (this.lockPromise) {
            await this.lockPromise;
        }
        // Create a new lock
        this.lockPromise = new Promise((resolve) => {
            this.resolveLock = resolve;
        });
    }
    release() {
        if (this.resolveLock) {
            this.resolveLock(); // Resolve the promise to release the lock
            this.lockPromise = null;
            this.resolveLock = null;
        }
    }
}
