import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameProps, Difficulty } from '../types/game';
import GameStats from './GameStats';
import DifficultySelector from './DifficultySelector';
import './TypingGame.css';

const DEFAULT_TEXT = "안녕하세요. 이것은 타이핑 게임의 샘플 텍스트입니다. 타이핑을 시작해보세요!";
const CHARS_PER_PAGE = 500;

const TypingGame: React.FC<GameProps> = ({ onComplete, text = DEFAULT_TEXT, difficulty = 'medium' }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentText: text,
    userInput: '',
    isCorrect: false,
    startTime: null,
    endTime: null,
    wpm: 0,
    errors: 0,
    accuracy: 100,
    currentWpm: 0,
    timeElapsed: 0,
    difficulty
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 텍스트를 페이지로 분할
    const textLines = text.split('\n');
    const title = textLines[0];
    const content = textLines.slice(2).join('\n');
    
    const contentPages = [];
    for (let i = 0; i < content.length; i += CHARS_PER_PAGE) {
      contentPages.push(content.slice(i, i + CHARS_PER_PAGE));
    }
    
    setPages([title, ...contentPages]);
    setCurrentPage(0);
  }, [text]);

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      currentText: pages[currentPage] || '',
      userInput: '',
      isCorrect: false,
      startTime: null,
      endTime: null,
      wpm: 0,
      errors: 0,
      accuracy: 100,
      currentWpm: 0,
      timeElapsed: 0,
      difficulty
    }));
  }, [currentPage, pages, difficulty]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentPage]);

  useEffect(() => {
    if (gameState.startTime && !gameState.isCorrect) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: Math.floor((Date.now() - prev.startTime!) / 1000),
          currentWpm: Math.round((prev.userInput.length / 5) / ((Date.now() - prev.startTime!) / 60000))
        }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.startTime, gameState.isCorrect]);

  const calculateAccuracy = (input: string, target: string): number => {
    if (input.length === 0) return 100;
    const errors = Array.from(input).filter((char, i) => char !== target[i]).length;
    return Math.round(((input.length - errors) / input.length) * 100);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setGameState(prev => {
      const isCorrect = input === prev.currentText;
      const endTime = isCorrect ? Date.now() : null;
      const wpm = isCorrect && prev.startTime
        ? Math.round((input.length / 5) / ((endTime! - prev.startTime) / 60000))
        : 0;
      const errors = Array.from(input).filter((char, i) => char !== prev.currentText[i]).length;
      const accuracy = calculateAccuracy(input, prev.currentText);

      return {
        ...prev,
        userInput: input,
        isCorrect,
        endTime,
        wpm,
        errors,
        accuracy
      };
    });
  };

  const handleStart = () => {
    setGameState(prev => ({
      ...prev,
      startTime: Date.now(),
      userInput: '',
      isCorrect: false,
      endTime: null,
      wpm: 0,
      errors: 0,
      accuracy: 100,
      currentWpm: 0,
      timeElapsed: 0
    }));
    inputRef.current?.focus();
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setGameState(prev => ({
      ...prev,
      difficulty: newDifficulty
    }));
  };

  const handlePageComplete = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      // 모든 페이지 완료
      if (onComplete) {
        const totalWpm = Math.round(
          (gameState.userInput.length / 5) / 
          ((Date.now() - gameState.startTime!) / 60000)
        );
        onComplete(totalWpm);
      }
    }
  };

  useEffect(() => {
    if (gameState.isCorrect && gameState.endTime) {
      handlePageComplete();
    }
  }, [gameState.isCorrect, gameState.endTime]);

  const renderTextComparison = () => {
    const { currentText, userInput } = gameState;
    const maxLength = Math.max(currentText.length, userInput.length);
    
    return Array.from({ length: maxLength }, (_, i) => {
      const targetChar = currentText[i] || '';
      const inputChar = userInput[i] || '';
      const isCorrect = targetChar === inputChar;
      const isTyped = i < userInput.length;
      
      return (
        <span
          key={i}
          className={`char ${isTyped ? (isCorrect ? 'correct' : 'incorrect') : ''} ${!isTyped && i < currentText.length ? 'remaining' : ''}`}
        >
          {isTyped ? inputChar : targetChar}
        </span>
      );
    });
  };

  return (
    <div className="typing-game">
      <DifficultySelector
        currentDifficulty={gameState.difficulty}
        onSelect={handleDifficultyChange}
      />
      <GameStats gameState={gameState} />
      <div className="text-display">
        <div className="text-comparison">
          {renderTextComparison()}
        </div>
        {pages.length > 1 && (
          <div className="page-indicator">
            {currentPage + 1} / {pages.length}
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          ref={inputRef}
          type="text"
          value={gameState.userInput}
          onChange={handleInput}
          placeholder="여기에 타이핑하세요..."
          disabled={gameState.isCorrect}
        />
        <button onClick={handleStart} disabled={!gameState.isCorrect}>
          다시 시작
        </button>
      </div>
      {gameState.isCorrect && currentPage === pages.length - 1 && (
        <div className="result">
          <p>완료! WPM: {gameState.wpm}</p>
        </div>
      )}
    </div>
  );
};

export default TypingGame; 