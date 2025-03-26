import React from 'react';
import { GameState } from '../types/game';
import './GameStats.css';

interface GameStatsProps {
  gameState: GameState;
}

const GameStats: React.FC<GameStatsProps> = ({ gameState }) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-stats">
      <div className="stat-item">
        <span className="stat-label">시간</span>
        <span className="stat-value">{formatTime(gameState.timeElapsed)}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">현재 WPM</span>
        <span className="stat-value">{gameState.currentWpm}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">정확도</span>
        <span className="stat-value">{gameState.accuracy}%</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">오타</span>
        <span className="stat-value">{gameState.errors}</span>
      </div>
    </div>
  );
};

export default GameStats; 