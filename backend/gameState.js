class GameState {
  constructor(players, wordDataset) {
    this.players = players; // List of players (CPU and Human)
    this.wordDataset = wordDataset; // Set of valid words
    this.currentPlayerIndex = 0;
    this.currentString = '';
    this.roundNumber = 1;
    this.loserLetters = Array(players.length).fill(''); // Tracks "IDIOT" letters
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  addLetter(letter, position) {
    if (position === 'start') {
      this.currentString = letter + this.currentString;
    } else {
      this.currentString = this.currentString + letter;
    }
  }

  challengePreviousPlayer() {
    const previousPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
    const previousPlayer = this.players[previousPlayerIndex];
    const word = previousPlayer.provideWord(this.currentString, this.wordDataset);

    if (!word) {
      this.loserLetters[previousPlayerIndex] += 'IDIOT'[this.loserLetters[previousPlayerIndex].length];
      return true; // Challenge successful
    }
    return false; // Challenge failed
  }

  isGameOver() {
    return this.loserLetters.some(letters => letters.length === 5);
  }

  resetRound() {
    this.currentString = '';
    this.roundNumber += 1;
  }
}

export default GameState;
