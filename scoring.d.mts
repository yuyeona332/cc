export type Side = "A" | "B";
export type TieBreak =
  | "response-count"
  | "strongest-response"
  | "latest-response"
  | "neutral-default"
  | null;

export interface ScoringQuestion {
  id: string;
  axis: string;
  side: Side;
}

export interface ScoringAxis {
  id: string;
  sideA: string;
  sideB: string;
  tieBreakSide?: Side;
}

export interface ScoredAxis {
  axis: ScoringAxis;
  rawScore: number;
  effectiveScore: number;
  maximumScore: number;
  percentA: number;
  percentB: number;
  winner: Side;
  tieBreak: TieBreak;
}

export interface ScoringResult {
  axes: ScoredAxis[];
  code: string;
}

export function scoreAnswers(
  questions: ScoringQuestion[],
  axes: ScoringAxis[],
  answers: Record<string, number>,
): ScoringResult;
