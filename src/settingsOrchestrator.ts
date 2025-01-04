import { CPUPlayer } from "./player/cpuPlayer.js";
import { HumanPlayer } from "./player/humanPlayer.js";
import { Player } from "./player/player.js";
import { Difficulty } from "./types/difficulty.js";
import { GameState } from "./gameState.js";

interface PlayerInfo {
  name: string;
  difficulty: Difficulty | null;
  cpuNumber?: number; // Only CPU players will have this property
}

export class SettingsOrchestrator {
  private players: PlayerInfo[] = [
    { name: "You", difficulty: null },
    { name: "CPU 1", cpuNumber: 1, difficulty: Difficulty.EASY },
  ];
  private availableCpus: number[] = [2, 3, 4, 5];
  private playerLock = new AsyncLock();

  setupStart(): void {
    const instructionsBtn = document.getElementById(
      "instructions-button"
    ) as HTMLButtonElement;
    instructionsBtn.addEventListener("click", function () {
      const instructionsText = document.getElementById(
        "instructions-text"
      ) as HTMLDivElement;
      instructionsText.classList.toggle("hidden");
      if (instructionsText.classList.contains("hidden")) {
        this.textContent = "Show Instructions";
      } else {
        this.textContent = "Hide Instructions";
      }
    });
    this.renderPlayers();
  }

  async setupComplete(gameState: GameState): Promise<Player[]> {
    await this.playerLock.acquire();
    return this.players.map((player) => {
      const playerObj =
        player.cpuNumber === null
          ? new HumanPlayer(player.name)
          : new CPUPlayer(
              player.name,
              gameState,
              player.difficulty as Difficulty
            );
      gameState.addPlayer(playerObj);
      return playerObj;
    });
  }

  private async addCpuPlayer(): Promise<void> {
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
    } finally {
      this.playerLock.release();
    }
  }

  private async removePlayer(index: number): Promise<void> {
    await this.playerLock.acquire();
    try {
      if (this.players.length === 2) {
        return;
      }
      this.disablePlayerButtons();

      const removedPlayer = this.players[index];
      if (removedPlayer.cpuNumber === undefined) {
        throw new Error(
          "This state should never be reached: invalid player number"
        );
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
    } finally {
      this.playerLock.release();
    }
  }

  private async moveRow(
    index: number,
    direction: "up" | "down"
  ): Promise<void> {
    await this.playerLock.acquire();
    try {
      const newPlayers = [...this.players];
      const currentPlayer = newPlayers[index];

      if (direction === "up" && index > 0) {
        newPlayers[index] = newPlayers[index - 1];
        newPlayers[index - 1] = currentPlayer;
      } else if (direction === "down" && index < newPlayers.length - 1) {
        newPlayers[index] = newPlayers[index + 1];
        newPlayers[index + 1] = currentPlayer;
      }
      this.players = [...newPlayers];

      this.renderPlayers();
    } finally {
      this.playerLock.release();
    }
  }

  private disablePlayerButtons() {
    const addButton = document.getElementById(
      "add-player"
    ) as HTMLButtonElement;
    addButton.disabled = true;

    const removeButtons = document.querySelectorAll(
      ".removePlayerButton"
    ) as NodeListOf<HTMLButtonElement>;
    removeButtons.forEach((button) => {
      button.disabled = true;
    });

    const moveUpButtons = document.querySelectorAll(
      ".move-up"
    ) as NodeListOf<HTMLButtonElement>;
    moveUpButtons.forEach((button) => {
      button.disabled = true;
    });

    const moveDownButtons = document.querySelectorAll(
      ".move-down"
    ) as NodeListOf<HTMLButtonElement>;
    moveDownButtons.forEach((button) => {
      button.disabled = true;
    });
  }

  private renderPlayers() {
    const playerListDiv = document.getElementById(
      "settingsPlayerList"
    ) as HTMLDivElement;
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
      moveDownButton.addEventListener("click", () =>
        this.moveRow(index, "down")
      );
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
          if (player.difficulty === difficulty) option.selected = true;
          difficultySelect.appendChild(option);
        });
        difficultySelect.className = "difficulty";

        difficultySelect.addEventListener("change", (e: Event) => {
          const target = e.target as HTMLSelectElement;
          this.players[index].difficulty = target.value as Difficulty;
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
        } else {
          removeButton.disabled = true;
        }
        playerDiv.appendChild(removeButton);
      } else {
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
  private lockPromise: Promise<void> | null = null;
  private resolveLock: (() => void) | null = null;

  async acquire(): Promise<void> {
    // If there’s an active lock, wait for it
    while (this.lockPromise) {
      await this.lockPromise;
    }

    // Create a new lock
    this.lockPromise = new Promise<void>((resolve) => {
      this.resolveLock = resolve;
    });
  }

  release(): void {
    if (this.resolveLock) {
      this.resolveLock(); // Resolve the promise to release the lock
      this.lockPromise = null;
      this.resolveLock = null;
    }
  }
}
