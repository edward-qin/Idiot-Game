import { Player } from "./player.js";
import { TurnAction } from "../types/turnAction.js";
import { ChallengeWord } from "../types/challengeWord.js";
import { Position } from "../types/turnAction.js";

export class HumanPlayer implements Player {
  name: string;
  idiotCount: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  async takeTurn(currentString: string): Promise<TurnAction> {
    const userInput = await this.getUserInput(
      currentString,
      this.isValidTurnAction
    );

    // Parse user input into TurnAction
    if (this.isTurnActionAppend(userInput, currentString)) {
      let position;
      let letter;
      if (userInput.startsWith(currentString)) {
        position = Position.END;
        letter = userInput[userInput.length - 1];
      } else if (userInput.endsWith(currentString)) {
        position = Position.START;
        letter = userInput[0];
      } else {
        throw new Error(
          "This state should never be reached: invalid user input"
        );
      }
      return { position: position, letter: letter };
    } else if (this.isTurnActionChallenge(userInput)) {
      return "Challenge!";
    } else {
      throw new Error("This state should never be reached: invalid user input");
    }
  }

  async respondToChallenge(currentString: string): Promise<ChallengeWord> {
    const userInput = await this.getUserInput(currentString, this.isValidWord);
    return { word: userInput };
  }

  addIdiotLetter(): void {
    this.idiotCount++;
  }

  getIdiotCount(): number {
    return this.idiotCount;
  }

  private async getUserInput(
    currentString: string,
    isValid: (input: string, currentString: string) => boolean
  ): Promise<string> {
    return new Promise<string>((resolve) => {
      const handleInput = () => {
        // Get user input and parse
        const userInput = (
          document.getElementById("gameUserInput") as HTMLInputElement
        ).value
          .trim()
          .toLowerCase();

        // Only accept user input if it meets specified condition
        if (isValid(userInput, currentString)) {
          resolve(userInput);
        } else {
          alert("Invalid input! Please try again.");
        }
      };

      this.addInputEventListeners(handleInput);
    });
  }

  private addInputEventListeners(handleInput: () => void): void {
    document
      .getElementById("gameSubmitMoveBtn")
      ?.addEventListener("click", handleInput);
    document
      .getElementById("gameUserInput")
      ?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          handleInput();
        }
      });
  }

  private isTurnActionAppend(input: string, currentString: string): boolean {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    return (
      input.length === currentString.length + 1 &&
      ((input.startsWith(currentString) &&
        alphabet.includes(input[input.length - 1])) ||
        (currentString.endsWith(input) && alphabet.includes(input[0])))
    );
  }

  private isTurnActionChallenge(input: string) {
    return /^challenge!+$/.test(input);
  }

  private isValidTurnAction(input: string, currentString: string): boolean {
    return (
      this.isTurnActionAppend(input, currentString) ||
      this.isTurnActionChallenge(input)
    );
  }

  private isValidWord(input: string, currentString: string): boolean {
    return /^[a-z]+$/.test(input) && input.length > currentString.length;
  }
}
