import { GameState } from "./gameState.js";
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
    this.startRound();
  }

  private async startRound() {
    console.log("started round", this.state);
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
    const currentPlayer = this.state.getCurrentPlayer();
    let action: TurnAction;
    try {
      action = await currentPlayer.takeTurn(this.state.currentString);
    } catch (e) {
      console.error("Error during turn: ", e);
      return;
    }

    if (this.isTurnActionAppend(action)) {
      this.handleAppend(action);
    } else if (this.isTurnActionChallenge(action)) {
      this.handleChallenge();
    }
  }

  private handleAppend(action: TurnActionAppend) {
    this.state.updateString(action);

    // Current Player completed a word: gains a letter
    if (this.state.wordSet.has(this.state.currentString)) {
      this.state.getCurrentPlayer().addIdiotLetter();
      this.endRound();
    }
    // Normal Action: Continue the round
    else {
      this.state.moveToNextPlayer();
      this.runTurn();
    }
  }

  private async handleChallenge() {
    // Move back to previous player
    this.state.moveToPreviousPlayer();
    const challengeWord = await this.state
      .getCurrentPlayer()
      .respondToChallenge(this.state.currentString);

    // The challenge was met and bypassed: The challenger gains a letter
    if (this.state.wordSet.has(challengeWord.word)) {
      this.state.moveToNextPlayer();
    }
    this.state.getCurrentPlayer().addIdiotLetter();
    this.endRound();
  }

  private updateGameUI(): void {
    // Update the chat-like UI with the latest state
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
}
