import React from 'react';
import { Difficulty } from '../types/game';
import './DifficultySelector.css';

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  onSelect,
}) => {
  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: '쉬움' },
    { value: 'medium', label: '보통' },
    { value: 'hard', label: '어려움' },
  ];

  return (
    <div className="difficulty-selector">
      {difficulties.map(({ value, label }) => (
        <button
          key={value}
          className={`difficulty-button ${currentDifficulty === value ? 'active' : ''}`}
          onClick={() => onSelect(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector; 