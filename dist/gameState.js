import { Position } from "./types/turnAction.js";
export class GameState {
    players = [];
    currentString = "";
    currentPlayerIndex = 0;
    wordSet;
    roundNum = 0;
    constructor(wordSet) {
        this.wordSet = wordSet;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    getNumPlayers() {
        return this.players.length;
    }
    moveToNextPlayer() {
        this.currentPlayerIndex =
            (this.currentPlayerIndex + 1) % this.players.length;
    }
    moveToPreviousPlayer() {
        this.currentPlayerIndex =
            (this.currentPlayerIndex + this.players.length - 1) % this.players.length;
    }
    updateString(action) {
        this.currentString =
            action.position === Position.START
                ? action.letter + this.currentString
                : this.currentString + action.letter;
    }
    getWordSet() {
        return this.wordSet;
    }
    advanceRound() {
        this.roundNum++;
    }
    getRoundNumber() {
        return this.roundNum;
    }
}
