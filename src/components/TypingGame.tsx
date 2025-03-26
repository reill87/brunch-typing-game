import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameProps } from '../types/game';
import './TypingGame.css';

const DEFAULT_TEXT = "안녕하세요. 이것은 타이핑 게임의 샘플 텍스트입니다. 타이핑을 시작해보세요!";

const TypingGame: React.FC<GameProps> = ({ onComplete, text = DEFAULT_TEXT }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentText: text,
    userInput: '',
    isCorrect: false,
    startTime: null,
    endTime: null,
    wpm: 0
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      currentText: text,
      userInput: '',
      isCorrect: false,
      startTime: null,
      endTime: null,
      wpm: 0
    }));
  }, [text]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setGameState(prev => {
      const isCorrect = input === prev.currentText;
      const endTime = isCorrect ? Date.now() : null;
      const wpm = isCorrect && prev.startTime
        ? Math.round((input.length / 5) / ((endTime! - prev.startTime) / 60000))
        : 0;

      return {
        ...prev,
        userInput: input,
        isCorrect,
        endTime,
        wpm
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
      wpm: 0
    }));
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (gameState.isCorrect && gameState.endTime && onComplete) {
      onComplete(gameState.wpm);
    }
  }, [gameState.isCorrect, gameState.endTime, gameState.wpm, onComplete]);

  return (
    <div className="typing-game">
      <div className="text-display">
        <p className="target-text">{gameState.currentText}</p>
        <p className={`user-input ${gameState.isCorrect ? 'correct' : ''}`}>
          {gameState.userInput}
        </p>
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
      {gameState.isCorrect && (
        <div className="result">
          <p>완료! WPM: {gameState.wpm}</p>
        </div>
      )}
    </div>
  );
};

export default TypingGame; 