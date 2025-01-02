# Class Structure

Classes will be written in typescript and compiled into javascript. The file structure is as follows:

```bash
Idiot-Game/
├── index.html
├── styles.css
├── script.js
├── tsconfig.json
├── src/
│   ├── orchestrator.ts
│   ├── gameState.ts
│   ├── player/
│   │   ├── player.ts
│   │   ├── cpuPlayer.ts
│   │   ├── humanPlayer.ts
│   ├── types/
│   │   ├── turnAction.ts
│   │   ├── challengeWord.ts
├── dist/
│   ├── orchestrator.js
│   ├── gameState.js
│   ├── player/
│   │   ├── player.js
│   │   ├── cpuPlayer.js
│   │   ├── humanPlayer.js
│   ├── types/
│   │   ├── turnAction.js
│   │   ├── challengeWord.js
```

## Game State

* List of Players
* Current String
* Current Player Turn (Last TurnAction)
* Word Set

## Orchestrator

The orchestrator manages the game state. It has a single function `startGame()` that takes in the setup GameState. On the front end, the screen changes to the main Game Play screen. In the backend, the orchestrator handles all invocations of player `takeTurn()` and `respondToChallenge()`. 

## Players

A `Player` interface will be implemented by the CPU Player and Human Player. Functionality supported involve:
* State: 
  * Player Name
  * Player Number of Letters in IDIOT
* Behavior:
  * `takeTurn()`: Take the turn (return a `TurnAction`)
  * `respondToChallenge()`: Produce word when challenged (return a `ChallengeWord`)

### CPU Player

The CPU Player behavior will be implemented as specified in the [design doc](DesignDoc.md).

### Human Player

When a human player is invoked on `takeTurn()`, the game must await the user response. This can be visually communicated by opening up the chat window. The promise is fulfilled when the user presses "Enter".

A similar prompt can be made for `respondToChallenge()`.

## TurnAction

There are two types of turn actions
* Append Letter
  * Letter to add
  * Position: "start" or "end"
* Challenge
  * No additional state

When the Orchestrator receives this, it updates the current string and moves to the next player's turn or calls `respondToChallenge()` for the previous player.

## ChallengeWord

This wraps around a word. When the Orchestrator receives this, it checks whether the word is a valid word ends the round. The next round is started.

# FrontEnd

There are 3 main screens:
* Start Menu (single button to "Start")
* Game Setup (Add/Remove CPU Players, Change Order, Set Difficulty)
* Game Play (Chat Window-style)

The logic to transition between screens lives in `script.js`. The styling and layout are in `index.html` and `styles.css`.

## Start Menu

This is simply a single button that shows the Game Setup screen.

## Game Setup

The main component is player list. Each player represents a row. There are 3 columns: Name, Difficulty, and a `-` button to remove the player. The human player cannot be removed. The Name is text and the Difficulty is a drop down. In the last row, there is a `+` button to add a CPU player, up to a 7 total CPU players. The button is hidden when 7 CPUs are reached. The rows are draggable to allow for changing player order.

Below this list is a button to start the game. An example of the layout is given below:

```
  Name                      Difficulty
# You                       
# CPU 1                     [Easy]        (-)
# CPU 2                     [Medium]      (-)
                                          (+)
              +--------------+
              |  Start Game  |
              +--------------+
```

The CPU Player Names are added such that the lowest un-added number is the next number, starting from 1. For example, if "CPU 1" and "CPU 3" exist and the user presses `+`, then the next CPU will be named "CPU 2".

## Game Play

Game play follows a chat-like terminal. This is to very clearly and organizationally demonstrate whose turn it is, the player order, and the history of letters each player added. An example of the layout is given below:

```
+-----------------------------------------------+
|  ...                                          |
|  -- Round 7 --                                |
|  YOU: A                                       |
|  CPU 1: AB                                    |
|  CPU 2: BAB                                   |
|  YOU: BABB                                    |
|  CPU 1: challenge                             |
|  YOU: BABBLE                                  |
|  -- Round 8 --                                |
|  CPU 1: Q                                     |
|  CPU 2: QA                                    |
+-----------------------------------------------+
[QAT                                      ] (Enter)

Current Status:
 You: ID
 CPU 1: I
 CPU 2: IDIO
```

During CPU player turns, the textbox for the user is grayed out and blocks user entries. During the human player's turn, this box is unblocked.