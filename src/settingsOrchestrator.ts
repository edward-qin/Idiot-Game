import { CPUPlayer } from "./player/cpuPlayer.js";
import { HumanPlayer } from "./player/humanPlayer.js";
import { Player } from "./player/player.js";
import { Difficulty } from "./types/difficulty.js";
import { GameState } from "./gameState.js";

export class SettingsOrchestrator {
  private players: any[] = [
    { name: "You", difficulty: null },
    { name: "CPU 1", cpuNumber: 1, difficulty: Difficulty.EASY },
  ];
  private availableCpus: number[] = [2, 3, 4, 5];

  setupStart(): void {
    const addCpuPlayerBtn = document.getElementById(
      "settingsAddCpuPlayerBtn"
    ) as HTMLButtonElement;
    addCpuPlayerBtn.addEventListener("click", this.addCpuPlayer);

    this.renderPlayers();
  }

  setupComplete(gameState: GameState): Player[] {
    return this.players.map((player) => {
      if (player.cpuNumber === null) {
        return new HumanPlayer(player.name);
      } else {
        return new CPUPlayer(player.name, gameState, player.difficulty);
      }
    });
  }

  private addCpuPlayer(): void {
    const number = this.availableCpus.shift();
    const newPlayer = {
      name: `CPU ${number}`,
      number: number,
      difficulty: Difficulty.EASY, // Default difficulty for new CPU
    };
    this.players.push(newPlayer);

    // Disallow adding more CPUs if we are max
    if (this.players.length == 6) {
      const button = document.getElementById(
        "settingsAddCpuPlayerBtn"
      ) as HTMLButtonElement;
      button.disabled = true;
    }
    this.renderPlayers();
  }

  private removePlayer(index: number): void {
    // Remove player and add as available CPU number
    const removedPlayer = this.players[index];
    this.players.splice(index, 1);
    this.availableCpus.splice(
      this.availableCpus.findIndex((elem) => elem >= removedPlayer.number),
      0
    );

    // Allow adding more CPUs
    if (this.players.length < 6) {
      const button = document.getElementById(
        "settingsAddCpuPlayerBtn"
      ) as HTMLButtonElement;
      button.disabled = false;
    }
    this.renderPlayers();
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
      if (player.cpuNumber !== null) {
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
          this.players[index].difficulty = target.value;
        });
        playerDiv.appendChild(difficultySelect);
      }

      // Add remove option for CPU players when there are at least 2 CPU players
      if (player.cpuNumber !== null && this.players.length >= 3) {
        const removeButton = document.createElement("button");
        removeButton.innerText = "Remove";
        removeButton.addEventListener("click", () => {
          this.removePlayer(index);
        });
        playerDiv.appendChild(removeButton);
      }

      playerListDiv.appendChild(playerDiv);
    });
  }
}
