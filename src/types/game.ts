export interface GameState {
  currentText: string;
  userInput: string;
  isCorrect: boolean;
  startTime: number | null;
  endTime: number | null;
  wpm: number;
}

export interface GameProps {
  onComplete?: (wpm: number) => void;
} 