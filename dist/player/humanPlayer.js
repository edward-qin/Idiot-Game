import { Position } from "../types/turnAction.js";
export class HumanPlayer {
    name;
    idiotCount = 0;
    constructor(name) {
        this.name = name;
    }
    async takeTurn(currentString) {
        if (currentString.length === 0) {
            this.updatePlayerHint("Your turn! Add a letter to start.");
        }
        else {
            this.updatePlayerHint("Your turn! Add a letter to the start or end.");
        }
        const userInput = await this.getUserInput(currentString, (input, currentString) => this.isValidTurnAction(input, currentString));
        this.updatePlayerHint();
        // Parse user input into TurnAction
        if (this.isTurnActionAppend(userInput, currentString)) {
            let position;
            let letter;
            if (userInput.startsWith(currentString)) {
                position = Position.END;
                letter = userInput[userInput.length - 1];
            }
            else if (userInput.endsWith(currentString)) {
                position = Position.START;
                letter = userInput[0];
            }
            else {
                throw new Error("This state should never be reached: invalid user input");
            }
            return { position: position, letter: letter };
        }
        else if (this.isTurnActionChallenge(userInput)) {
            return "Challenge!";
        }
        else {
            throw new Error("This state should never be reached: invalid user input");
        }
    }
    async respondToChallenge(currentString) {
        this.updatePlayerHint("You got challenged! Provide a word containing the previous string.");
        const userInput = await this.getUserInput(currentString, this.isValidWord);
        this.updatePlayerHint();
        return { word: userInput };
    }
    addIdiotLetter() {
        this.idiotCount++;
    }
    getIdiotCount() {
        return this.idiotCount;
    }
    async getUserInput(currentString, isValid) {
        return new Promise((resolve) => {
            const handleInput = () => {
                // Get user input and parse
                const userInput = document.getElementById("gameUserInput").value
                    .trim()
                    .toLowerCase();
                // Only accept user input if it meets specified condition
                const error = isValid(userInput, currentString);
                if (error === "") {
                    this.closeDOMForInput();
                    this.removeInputEventListeners(handleInput, handleInputEnter, handleChallenge);
                    resolve(userInput);
                }
                else {
                    this.updatePlayerHint(error);
                }
            };
            const handleInputEnter = (event) => {
                if (event.key === "Enter") {
                    handleInput();
                }
            };
            const handleChallenge = () => {
                if (currentString.length !== 0) {
                    this.closeDOMForInput();
                    this.removeInputEventListeners(handleInput, handleInputEnter, handleChallenge);
                    resolve("challenge!");
                }
            };
            // Update DOM
            this.setDOMForInput(currentString);
            this.addInputEventListeners(handleInput, handleInputEnter, handleChallenge);
        });
    }
    updatePlayerHint(msg = "") {
        const playerHint = document.getElementById("gamePlayerPrompt");
        playerHint.textContent = msg;
    }
    setDOMForInput(currentString) {
        const inputText = document.getElementById("gameUserInput");
        inputText.value = currentString;
        inputText.disabled = false;
        const enterBtn = document.getElementById("gameSubmitMoveBtn");
        enterBtn.disabled = false;
        const challengeBtn = document.getElementById("gameChallengeBtn");
        challengeBtn.disabled = currentString.length === 0;
    }
    closeDOMForInput() {
        const inputText = document.getElementById("gameUserInput");
        inputText.value = "";
        inputText.disabled = true;
        const enterBtn = document.getElementById("gameSubmitMoveBtn");
        enterBtn.disabled = true;
        const challengeBtn = document.getElementById("gameChallengeBtn");
        challengeBtn.disabled = true;
    }
    addInputEventListeners(handleInput, handleInputEnter, handleChallenge) {
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
    removeInputEventListeners(handleInput, handleInputEnter, handleChallenge) {
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
    isTurnActionAppend(input, currentString) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        return (input.length === currentString.length + 1 &&
            ((input.startsWith(currentString) &&
                alphabet.includes(input[input.length - 1])) ||
                (input.endsWith(currentString) && alphabet.includes(input[0]))));
    }
    isTurnActionChallenge(input) {
        return /^challenge!+$/.test(input);
    }
    /**
     * Verifies input is valid turn action
     * @param input string from user
     * @param currentString from previous turn
     * @returns string indicating error (or empty string if no error)
     */
    isValidTurnAction(input, currentString) {
        const isAppend = this.isTurnActionAppend(input, currentString);
        const isChallenge = this.isTurnActionChallenge(input);
        if (isAppend || isChallenge) {
            return "";
        }
        else if (currentString.length == 0) {
            return "Invalid input: Type only a single letter to start!";
        }
        else {
            return "Invalid input: Make sure the input contains the previous string with exactly 1 letter added!";
        }
    }
    /**
     * Verifies input is valid word
     * @param input string from user
     * @param currentString from previous turn
     * @returns string indicating error (or empty string if no error)
     */
    isValidWord(input, currentString) {
        if (/^[a-z]+$/.test(input) && input.length > currentString.length) {
            return "";
        }
        else {
            return "Invalid input: Make sure the word contains the current string!";
        }
    }
}
