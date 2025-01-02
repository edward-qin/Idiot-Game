export const Difficulty = Object.freeze({
  EASY: 'Easy',
  MEDIUM: 'Medium'
});

export const CPUPlayer = class {
  constructor(name, difficulty) {
    this.name = name;
    this.difficulty = difficulty;
  }

  takeTurn(currentString, wordDataset) {
    const possibleWords = Array.from(wordDataset).filter(word => word.includes(currentString));

    if (possibleWords.length === 0) {
      return { action: 'challenge' };
    }

    if (this.difficulty === Difficulty.EASY) {
      return this.easyStrategy(currentString, possibleWords);
    } else if (this.difficulty === Difficulty.MEDIUM) {
      return this.mediumStrategy(currentString, possibleWords);
    }
  }

  easyStrategy(currentString, possibleWords) {
    // TODO: implement
    return { action: 'addLetter', letter: nextLetter, position: 'end' };
  }

  mediumStrategy(currentString, possibleWords) {
    // TODO: implement
    return this.easyStrategy(currentString, possibleWords);
  }

  provideWord(currentString, wordDataset) {
    return Array.from(wordDataset).find(word => word.includes(currentString));
  }
};