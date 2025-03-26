import React from 'react';
import './App.css';
import TypingGame from './components/TypingGame';

function App() {
  const handleGameComplete = (wpm: number) => {
    console.log(`게임 완료! WPM: ${wpm}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>타이핑 게임</h1>
      </header>
      <main>
        <div className="game-container">
          <TypingGame onComplete={handleGameComplete} />
        </div>
      </main>
    </div>
  );
}

export default App; 