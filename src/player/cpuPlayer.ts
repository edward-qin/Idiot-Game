import { Player } from "./player.js";
import { ChallengeWord } from "../types/challengeWord.js";
import { Position, TurnAction } from "../types/turnAction.js";
import { GameState } from "../gameState.js";
import { Difficulty } from "../types/difficulty.js";

export class CPUPlayer implements Player {
  name: string;
  idiotCount: number = 0;
  gameState: GameState;
  difficulty: Difficulty;

  constructor(name: string, gameState: GameState, difficulty: Difficulty) {
    this.name = name;
    this.gameState = gameState;
    this.difficulty = difficulty;
  }

  async takeTurn(currentString: string): Promise<TurnAction> {
    const possibleWords = this.getWordsContainingString(currentString);
    if (possibleWords.length === 0) {
      return "Challenge!";
    }

    switch (this.difficulty) {
      case Difficulty.EASY:
        return this.addLetterEasy(currentString, possibleWords);
      case Difficulty.MEDIUM:
        return this.addLetterMedium(currentString, possibleWords);
      default:
        throw new Error(
          "This state should never be reached: invalid difficulty level"
        );
    }
  }

  async respondToChallenge(currentString: string): Promise<ChallengeWord> {
    const possibleWords = this.getWordsContainingString(currentString);
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    // Choose a random word, if possible
    const word =
      possibleWords.length === 0
        ? currentString + alphabet[Math.floor(Math.random() * alphabet.length)]
        : possibleWords[Math.floor(Math.random() * possibleWords.length)];
    return { word: word };
  }

  addIdiotLetter(): void {
    this.idiotCount++;
  }

  getIdiotCount(): number {
    return this.idiotCount;
  }

  private getWordsContainingString(
    currentString: string,
    wordSet: string[] | Set<string> = this.gameState.getWordSet()
  ): string[] {
    const possibleWords = [...wordSet].filter((word) =>
      word.includes(currentString)
    );
    return possibleWords;
  }

  private addLetterEasy(
    currentString: string,
    possibleWords: string[]
  ): TurnAction {
    // Find a random word that ideally does not result in player completing word
    const numPlayers = this.gameState.getNumPlayers();
    const unwantedParity = (currentString.length + 1) % numPlayers;
    const nonKillingWords = possibleWords.filter(
      (word) => word.length % numPlayers !== unwantedParity
    );
    const pursuedWord: string =
      nonKillingWords.length === 0
        ? possibleWords[Math.floor(Math.random() * possibleWords.length)]
        : nonKillingWords[Math.floor(Math.random() * nonKillingWords.length)];

    // Choose letter in the pursued word
    let letter: string;
    let position: Position;

    // Only one option for the letter
    if (pursuedWord.startsWith(currentString)) {
      letter = pursuedWord[pursuedWord.length - 1];
      position = Position.END;
    } else if (pursuedWord.endsWith(currentString)) {
      letter = pursuedWord[0];
      position = Position.START;

      // Choose random side to add the letter
    } else {
      const currentIndex = pursuedWord.indexOf(currentString);
      position = Math.random() < 0.5 ? Position.START : Position.END;
      letter =
        position === Position.START
          ? pursuedWord[currentIndex - 1]
          : pursuedWord[currentIndex + currentString.length];
    }
    return { letter: letter, position: position };
  }

  private computeProbabilityBadWord(
    candidateString: string,
    candidateWords: string[]
  ): number {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const numPlayers = this.gameState.getNumPlayers();
    const thisPlayerIndex = candidateString.length % numPlayers;
    let currPlayerIndex = (thisPlayerIndex + 1) % numPlayers;
    let totalBadWordProb = 0.0;

    // Layer Ordered BFS to obtain total probability of getting a bad word for this player.
    // Assume each player chooses an action randomly weighted by the number of possible
    // subsequent words that that player does not complete.
    // Queue: [(probability of this string, the string, [words containing this string])]
    let queue: [number, string, string[]][] = [
      [1.0, candidateString, candidateWords],
    ];

    while (queue.length !== 0) {
      const nextQueue: [number, string, string[]][] = [];
      for (const [prevProbability, currString, currWords] of queue) {
        // Do not continue if this would complete a word
        if (this.gameState.getWordSet().has(currString)) {
          // The string is also a word that this player would complete (bad word)
          if (currString.length % numPlayers === thisPlayerIndex) {
            totalBadWordProb += prevProbability;
          }
          continue;
        }

        const scores = [];
        const wordSets: string[][] = [];

        // Compute estimated probabilities for the current player to take each possible action
        for (let position of [Position.START, Position.END] as const) {
          for (let letter of alphabet) {
            const nextString =
              position === Position.START
                ? letter + currString
                : currString + letter;
            const nextWords = this.getWordsContainingString(
              nextString,
              currWords
            );
            // Number of words that the current player would NOT complete
            const numGood = nextWords.filter(
              (word) => word.length % numPlayers !== currPlayerIndex
            ).length;
            scores.push(numGood);
            wordSets.push(nextWords);
          }
        }

        // Add candidates to next layer
        const sumOfScores = scores.reduce((acc, score) => acc + score, 0);
        scores.forEach((value, index) => {
          // This action has possible good words for the current player
          if (value !== 0) {
            const letter = alphabet[index % alphabet.length];
            const nextSubstring =
              index < alphabet.length
                ? letter + currString
                : currString + letter;
            nextQueue.push([
              (prevProbability * value) / sumOfScores,
              nextSubstring,
              wordSets[index],
            ]);
          }
        });
      }
      queue = nextQueue;
      currPlayerIndex = (currPlayerIndex + 1) % numPlayers;
    }
    return totalBadWordProb;
  }

  private addLetterMedium(
    currentString: string,
    possibleWords: string[]
  ): TurnAction {
    // Recursive exploration can be very large if the current string is too short
    if (currentString.length <= 2) {
      return this.addLetterEasy(currentString, possibleWords);
    }

    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const scores: number[] = []; // Estimated probabilities of not resulting in a bad word

    // Compute the estimated probability of a bad word for each possible turn action
    for (let position of [Position.START, Position.END] as const) {
      for (let letter of alphabet) {
        const candidateString =
          position === Position.START
            ? letter + currentString
            : currentString + letter;

        // A word is completed: Assign 0 probability to this option
        if (this.gameState.getWordSet().has(candidateString)) {
          scores.push(0.0);

          // Compute the probability using a BFS layered traversal
        } else {
          const candidateWords = this.getWordsContainingString(
            candidateString,
            possibleWords
          );
          scores.push(
            1.0 -
              this.computeProbabilityBadWord(candidateString, candidateWords)
          );
        }
      }
    }

    // Compute Probability Distribution
    const sumOfScores = scores.reduce((acc, score) => acc + score, 0);
    const pmf = scores.map((score) => score / sumOfScores);
    const cdf = pmf.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
    console.log(cdf);

    const randomChoice = Math.random();
    const selectedIndex = cdf.findIndex((el) => randomChoice <= el);

    const letter = alphabet[selectedIndex % alphabet.length];
    const position =
      selectedIndex < alphabet.length ? Position.START : Position.END;
    return { letter: letter, position: position };
  }
}
