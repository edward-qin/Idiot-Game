export class GameOrchestrator {
    state;
    constructor(state) {
        this.state = state;
    }
    startGame() {
        const instructionsBtn = document.getElementById("gameInstructionsButton");
        instructionsBtn.addEventListener("click", function () {
            const instructionsText = document.getElementById("gameInstructionsText");
            instructionsText.classList.toggle("hidden");
            if (instructionsText.classList.contains("hidden")) {
                this.textContent = "Show Instructions";
            }
            else {
                this.textContent = "Hide Instructions";
            }
        });
        this.startRound();
    }
    async startRound() {
        console.log("started round", this.state);
        this.addSystemRoundStart();
        this.runTurn();
    }
    isTurnActionAppend(action) {
        return action.letter !== undefined;
    }
    isTurnActionChallenge(action) {
        return action === "Challenge!";
    }
    async runTurn() {
        await this.sleep(1000);
        const currentPlayer = this.state.getCurrentPlayer();
        const action = await currentPlayer.takeTurn(this.state.currentString);
        if (this.isTurnActionAppend(action)) {
            this.handleAppend(action);
        }
        else if (this.isTurnActionChallenge(action)) {
            this.handleChallenge();
        }
    }
    handleAppend(action) {
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
    async handleChallenge() {
        this.addPlayerTurn(this.state.getCurrentPlayer(), "Challenge!");
        // Move back to previous player
        await this.sleep(1000);
        this.state.moveToPreviousPlayer();
        const challengeWord = await this.state
            .getCurrentPlayer()
            .respondToChallenge(this.state.currentString);
        this.addPlayerChallengeResponse(this.state.getCurrentPlayer(), challengeWord);
        // The challenge was met and bypassed: The challenger gains a letter
        if (this.state.wordSet.has(challengeWord.word)) {
            this.state.moveToNextPlayer();
        }
        await this.sleep(500);
        this.addSystemPlayerLoss(this.state.getCurrentPlayer());
        this.endRound();
    }
    endRound() {
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
    endGame() { }
    updateChatWindow(msgDiv) {
        const chatWindow = document.getElementById("gameChatWindow");
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    addPlayerTurn(player, turnAction) {
        console.log(this.state.getCurrentPlayer(), this.state.currentString);
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("playerMessage");
        if (this.isTurnActionAppend(turnAction)) {
            messageDiv.innerHTML = `<strong>${player.name}: </strong> ${this.state.currentString}`;
        }
        else {
            messageDiv.innerHTML = `<strong>${player.name}: </strong> CHALLENGE!`;
        }
        this.updateChatWindow(messageDiv);
    }
    addPlayerChallengeResponse(player, challengeWord) {
        console.log(this.state.getCurrentPlayer(), this.state.currentString);
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("playerMessage");
        messageDiv.innerHTML = `<strong>${player.name}: </strong> ${challengeWord.word}`;
        this.updateChatWindow(messageDiv);
    }
    addSystemPlayerLoss(player) {
        player.addIdiotLetter();
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("systemPlayerMessage");
        messageDiv.textContent = `${player.name} gained a letter and ${player.name === "You" ? "are" : "is"} now an ${"IDIOT".slice(0, player.getIdiotCount())}`;
        this.updateChatWindow(messageDiv);
    }
    addSystemRoundStart() {
        this.state.advanceRound();
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("systemRoundMessage");
        messageDiv.textContent = `-- Round ${this.state.getRoundNumber()} --`;
        this.updateChatWindow(messageDiv);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
