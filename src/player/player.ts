import { TurnAction } from "../types/turnAction.js";
import { ChallengeWord } from "../types/challengeWord.js";

export interface Player {
  name: string;
  idiotCount: number;

  takeTurn(currentString: string): Promise<TurnAction>;
  respondToChallenge(currentString: string): Promise<ChallengeWord>;
  addIdiotLetter(): void;
  getIdiotCount(): number;
}
