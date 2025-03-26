export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameState {
  currentText: string;
  userInput: string;
  isCorrect: boolean;
  startTime: number | null;
  endTime: number | null;
  wpm: number;
  errors: number;
  accuracy: number;
  currentWpm: number;
  timeElapsed: number;
  difficulty: Difficulty;
}

export interface GameProps {
  onComplete?: (wpm: number) => void;
  text?: string;
  difficulty?: Difficulty;
} 