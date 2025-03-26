import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameProps, Difficulty } from '../types/game';
import GameStats from './GameStats';
import DifficultySelector from './DifficultySelector';
import './TypingGame.css';

const DEFAULT_TEXT = "안녕하세요. 이것은 타이핑 게임의 샘플 텍스트입니다. 타이핑을 시작해보세요!";
const CHARS_PER_PAGE = 200;

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
      endTime: null,
      wpm: 0,
      errors: 0,
      accuracy: 100,
      // startTime, currentWpm, timeElapsed는 유지
    }));

    // 페이지 변경 시 입력창에 포커스 유지
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [currentPage, pages, difficulty]);

  // 타이머 업데이트
  useEffect(() => {
    if (gameState.startTime && !gameState.isCorrect) {
      // 타이머 시작
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const currentTime = Date.now();
          const elapsedSeconds = Math.floor((currentTime - prev.startTime!) / 1000);
          const currentCpm = Math.round((prev.userInput.length / (elapsedSeconds / 60)));
          
          return {
            ...prev,
            timeElapsed: elapsedSeconds,
            currentWpm: currentCpm
          };
        });
      }, 1000);
    } else {
      // 타이머 정지
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
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
      // 첫 글자 입력 시 타이머 시작
      if (prev.userInput.length === 0 && input.length === 1) {
        return {
          ...prev,
          startTime: Date.now(),
          userInput: input,
          isCorrect: false,
          endTime: null,
          wpm: 0,
          errors: 0,
          accuracy: 100,
          currentWpm: 0,
          timeElapsed: 0
        };
      }

      const isCorrect = input === prev.currentText;
      const endTime = isCorrect ? Date.now() : null;
      const wpm = isCorrect && prev.startTime
        ? Math.round((input.length / ((endTime! - prev.startTime) / 60000)))
        : 0;
      const errors = Array.from(input).filter((char, i) => char !== prev.currentText[i]).length;
      const accuracy = calculateAccuracy(input, prev.currentText);

      // 현재 페이지의 텍스트와 입력이 정확히 일치할 때만 다음 페이지로 넘어가기
      if (isCorrect && input.length === prev.currentText.length) {
        setTimeout(() => {
          handlePageComplete();
        }, 100); // 약간의 지연을 주어 사용자가 완료를 인지할 수 있도록 함
      }

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
    // 타이머 초기화
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }

    setGameState(prev => ({
      ...prev,
      startTime: Date.now(),  // 바로 현재 시간으로 설정
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
        const totalCpm = Math.round(
          (gameState.userInput.length / 
          ((Date.now() - gameState.startTime!) / 60000))
        );
        onComplete(totalCpm);
      }
    }
  };

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
        <button onClick={handleStart}>
          다시 시작
        </button>
      </div>
      {gameState.isCorrect && currentPage === pages.length - 1 && (
        <div className="result">
          <p>완료! 분당 타자수: {gameState.wpm}</p>
        </div>
      )}
    </div>
  );
};

export default TypingGame; 