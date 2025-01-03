export type TurnAction = TurnActionAppend | TurnActionChallenge;

export type TurnActionAppend = { letter: string; position: Position };
export type TurnActionChallenge = "Challenge";

export enum Position {
  START = "start",
  END = "end",
}
