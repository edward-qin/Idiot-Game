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
    if (currentString.length === 0) {
      this.updatePlayerHint("Your turn! Add a letter to start.");
    } else {
      this.updatePlayerHint("Your turn! Add a letter to the start or end.");
    }
    const userInput = await this.getUserInput(
      currentString,
      (input, currentString) => this.isValidTurnAction(input, currentString)
    );
    this.updatePlayerHint();

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
    this.updatePlayerHint(
      "You got challenged! Provide a word containing the previous string."
    );
    const userInput = await this.getUserInput(
      currentString,
      this.isValidWord);
    this.updatePlayerHint();
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
    isValid: (input: string, currentString: string) => string
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
        const error = isValid(userInput, currentString)
        if (error === "") {
          this.closeDOMForInput();
          this.removeInputEventListeners(
            handleInput,
            handleInputEnter,
            handleChallenge
          );
          resolve(userInput);
        } else {
          this.updatePlayerHint(error);
        }
      };

      const handleInputEnter = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          handleInput();
        }
      };

      const handleChallenge = () => {
        if (currentString.length !== 0) {
          this.closeDOMForInput();
          this.removeInputEventListeners(
            handleInput,
            handleInputEnter,
            handleChallenge
          );
          resolve("challenge!");
        }
      };

      // Update DOM
      this.setDOMForInput(currentString);
      this.addInputEventListeners(
        handleInput,
        handleInputEnter,
        handleChallenge
      );
    });
  }

  private updatePlayerHint(msg: string = "") {
    const playerHint = document.getElementById(
      "gamePlayerPrompt"
    ) as HTMLDivElement;
    playerHint.textContent = msg;
  }

  private setDOMForInput(currentString: string) {
    const inputText = document.getElementById(
      "gameUserInput"
    ) as HTMLInputElement;
    inputText.value = currentString;
    inputText.disabled = false;
    const enterBtn = document.getElementById(
      "gameSubmitMoveBtn"
    ) as HTMLButtonElement;
    enterBtn.disabled = false;
    const challengeBtn = document.getElementById(
      "gameChallengeBtn"
    ) as HTMLButtonElement;
    challengeBtn.disabled = currentString.length === 0;
  }

  private closeDOMForInput() {
    const inputText = document.getElementById(
      "gameUserInput"
    ) as HTMLInputElement;
    inputText.value = "";
    inputText.disabled = true;
    const enterBtn = document.getElementById(
      "gameSubmitMoveBtn"
    ) as HTMLButtonElement;
    enterBtn.disabled = true;
    const challengeBtn = document.getElementById(
      "gameChallengeBtn"
    ) as HTMLButtonElement;
    challengeBtn.disabled = true;
  }

  private addInputEventListeners(
    handleInput: () => void,
    handleInputEnter: (event: KeyboardEvent) => void,
    handleChallenge: () => void
  ): void {
    document
      .getElementById("gameSubmitMoveBtn")
      ?.addEventListener("click", handleInput);
    document
      .getElementById("gameUserInput")
      ?.addEventListener("keydown", handleInputEnter);
    document
      .getElementById("gameChallengeBtn")
      ?.addEventListener("click", handleChallenge);
  }

  private removeInputEventListeners(
    handleInput: () => void,
    handleInputEnter: (event: KeyboardEvent) => void,
    handleChallenge: () => void
  ): void {
    document
      .getElementById("gameSubmitMoveBtn")
      ?.removeEventListener("click", handleInput);
    document
      .getElementById("gameUserInput")
      ?.removeEventListener("keydown", handleInputEnter);
    document
      .getElementById("gameChallengeBtn")
      ?.removeEventListener("click", handleChallenge);
  }

  private isTurnActionAppend(input: string, currentString: string): boolean {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    return (
      input.length === currentString.length + 1 &&
      ((input.startsWith(currentString) &&
        alphabet.includes(input[input.length - 1])) ||
        (input.endsWith(currentString) && alphabet.includes(input[0])))
    );
  }

  private isTurnActionChallenge(input: string) {
    return /^challenge!+$/.test(input);
  }

  /**
   * Verifies input is valid turn action
   * @param input string from user
   * @param currentString from previous turn
   * @returns string indicating error (or empty string if no error)
   */
  private isValidTurnAction(input: string, currentString: string): string {
    const isAppend = this.isTurnActionAppend(input, currentString);
    const isChallenge = this.isTurnActionChallenge(input);
    if (isAppend || isChallenge) {
      return "";
    } else if (currentString.length == 0) {
      return "Invalid input: Type only a single letter to start!";
    } else {
      return "Invalid input: Make sure the input contains the previous string with exactly 1 letter added!"
    }
  }

  /**
   * Verifies input is valid word
   * @param input string from user
   * @param currentString from previous turn
   * @returns string indicating error (or empty string if no error)
   */
  private isValidWord(input: string, currentString: string): string {
    if (/^[a-z]+$/.test(input) && input.length > currentString.length) {
      return "";
    } else {
      return "Invalid input: Make sure the word contains the current string!"
    }
  }
}
