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
    const addCpuPlayerBtn = document.getElementById(
      "settingsAddCpuPlayerBtn"
    ) as HTMLButtonElement;

    addCpuPlayerBtn.addEventListener("click", () => this.addCpuPlayer());

    this.renderPlayers();
  }

  async setupComplete(gameState: GameState): Promise<Player[]> {
    await this.playerLock.acquire();
    return this.players.map((player) => {
      if (player.cpuNumber === null) {
        return new HumanPlayer(player.name);
      } else {
        return new CPUPlayer(
          player.name,
          gameState,
          player.difficulty as Difficulty
        );
      }
    });
  }

  private async addCpuPlayer(): Promise<void> {
    await this.playerLock.acquire();
    console.log("Enter add:", this.players, this.availableCpus)
    try {
      if (this.availableCpus.length === 0) {
        return;
      }
      this.disableAddRemovePlayerButtons();

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
    console.log("Enter remove:", this.players, this.availableCpus)
    try {
      if (this.players.length === 2) {
        return;
      }
      this.disableAddRemovePlayerButtons();

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
      console.log("In remove:", this.players, this.availableCpus)
      this.renderPlayers();
    } finally {
      this.playerLock.release();
    }
  }

  private disableAddRemovePlayerButtons() {
    const addButton = document.getElementById(
      "settingsAddCpuPlayerBtn"
    ) as HTMLButtonElement;
    addButton.disabled = true;

    const removeButtons = document.querySelectorAll(
      ".removePlayerButton"
    ) as NodeListOf<HTMLButtonElement>;
    removeButtons.forEach((button) => {
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

      const nameSpan = document.createElement("span");
      nameSpan.innerText = player.name;
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

        if (this.players.length >= 3) {
          removeButton.addEventListener("click", () => {
            this.removePlayer(index);
          });
          removeButton.disabled = false;
        } else {
          removeButton.disabled = true;
        }
        playerDiv.appendChild(removeButton);
      }

      playerListDiv.appendChild(playerDiv);
    });

    // Allow adding more CPUs
    if (this.players.length < 6) {
      const button = document.getElementById(
        "settingsAddCpuPlayerBtn"
      ) as HTMLButtonElement;
      button.disabled = false;
    }
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

