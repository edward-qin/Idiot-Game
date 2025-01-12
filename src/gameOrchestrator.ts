import { GameState } from "./gameState.js";
import { Player } from "./player/player.js";
import {
  TurnAction,
  TurnActionAppend,
  TurnActionChallenge,
} from "./types/turnAction";

export class GameOrchestrator {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  startGame(): void {
    const instructionsBtn = document.getElementById(
      "gameInstructionsButton"
    ) as HTMLButtonElement;
    instructionsBtn.addEventListener("click", function () {
      const instructionsText = document.getElementById(
        "gameInstructionsText"
      ) as HTMLDivElement;
      instructionsText.classList.toggle("hidden");
      if (instructionsText.classList.contains("hidden")) {
        this.textContent = "Show Instructions";
      } else {
        this.textContent = "Hide Instructions";
      }
    });
    this.startRound();
  }

  private async startRound() {
    console.log("started round", this.state);
    this.addSystemRoundStart();
    this.runTurn();
  }

  private isTurnActionAppend(action: TurnAction): action is TurnActionAppend {
    return (action as TurnActionAppend).letter !== undefined;
  }

  private isTurnActionChallenge(
    action: TurnAction
  ): action is TurnActionChallenge {
    return (action as TurnActionChallenge) === "Challenge!";
  }

  private async runTurn(): Promise<void> {
    await this.sleep(1000);

    const currentPlayer = this.state.getCurrentPlayer();
    const action = await currentPlayer.takeTurn(this.state.currentString);

    if (this.isTurnActionAppend(action)) {
      this.handleAppend(action);
    } else if (this.isTurnActionChallenge(action)) {
      this.handleChallenge();
    }
  }

  private handleAppend(action: TurnActionAppend) {
    this.state.updateString(action);
    this.addPlayerTurn(this.state.getCurrentPlayer(), action);

    // Current Player completed a word: gains a letter
    if (this.state.wordSet.has(this.state.currentString)) {
      this.addSystemPlayerLoss(this.state.getCurrentPlayer());
      this.endRound();
    }
    // Normal Action: Continue the round
    else {
      this.state.moveToNextPlayer();
      this.runTurn();
    }
  }

  private async handleChallenge() {
    this.addPlayerTurn(this.state.getCurrentPlayer(), "Challenge!");

    // Move back to previous player
    this.state.moveToPreviousPlayer();
    const challengeWord = await this.state
      .getCurrentPlayer()
      .respondToChallenge(this.state.currentString);

    // The challenge was met and bypassed: The challenger gains a letter
    if (this.state.wordSet.has(challengeWord.word)) {
      this.state.moveToNextPlayer();
    }
    this.addSystemPlayerLoss(this.state.getCurrentPlayer());
    this.endRound();
  }

  private endRound(): void {
    this.state.currentString = "";

    // The current player is an IDIOT
    if (this.state.getCurrentPlayer().idiotCount == 5) {
      this.endGame();
    }
    // Start the next round
    else {
      this.startRound();
    }
  }

  private endGame(): void {}

  private updateChatWindow(msgDiv: HTMLDivElement): void {
    const chatWindow = document.getElementById(
      "gameChatWindow"
    ) as HTMLDivElement;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  private addPlayerTurn(player: Player, turnAction: TurnAction): void {
    console.log(this.state.getCurrentPlayer(), this.state.currentString);

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("playerMessage");
    if (this.isTurnActionAppend(turnAction)) {
      messageDiv.innerHTML = `<strong>${player.name}: </strong> ${this.state.currentString}`;
    } else {
      messageDiv.innerHTML = `<strong>${player.name}: </strong> CHALLENGE!`;
    }
    this.updateChatWindow(messageDiv);
  }

  private addSystemPlayerLoss(player: Player): void {
    player.addIdiotLetter();

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("systemPlayerMessage");
    messageDiv.textContent = `${player.name} gained a letter and ${
      player.name === "You" ? "are" : "is"
    } now an ${"IDIOT".slice(0, player.getIdiotCount())}`;
    this.updateChatWindow(messageDiv);
  }

  private addSystemRoundStart(): void {
    this.state.advanceRound();
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("systemRoundMessage");
    messageDiv.textContent = `-- Round ${this.state.getRoundNumber()} --`;
    this.updateChatWindow(messageDiv);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
