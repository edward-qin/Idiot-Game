import { Player } from "./player/player";
import { TurnActionAppend } from "./types/turnAction";
import { Position } from "./types/turnAction";

export class GameState {
  players: Player[] = [];
  currentString: string = "";
  currentPlayerIndex: number = 0;
  wordSet: Set<string>;

  constructor(wordSet: Set<string>) {
    this.wordSet = wordSet;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  getNumPlayers(): number {
    return this.players.length;
  }

  moveToNextPlayer(): void {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  moveToPreviousPlayer(): void {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + this.players.length - 1) % this.players.length;
  }

  updateString(action: TurnActionAppend): void {
    this.currentString =
      action.position === Position.START
        ? action.letter + this.currentString
        : this.currentString + action.letter;
  }

  getWordSet(): Set<string> {
    return this.wordSet;
  }
}
