import { TurnAction } from "../types/turnAction";
import { ChallengeWord } from "../types/challengeWord";

export interface Player {
  name: string;
  idiotCount: number;

  takeTurn(currentString: string): Promise<TurnAction>;
  respondToChallenge(currentString: string): Promise<ChallengeWord>;
  addIdiotLetter(): void;
  getIdiotCount(): number;
}
