import React, { useState } from 'react';
import './App.css';
import TypingGame from './components/TypingGame';
import UrlInput from './components/UrlInput';

function App() {
  const [gameText, setGameText] = useState<string>('');

  const handleGameComplete = (wpm: number) => {
    console.log(`게임 완료! WPM: ${wpm}`);
  };

  const handleTextExtracted = (text: string) => {
    setGameText(text);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>타이핑 게임</h1>
      </header>
      <main>
        <div className="game-container">
          <UrlInput onTextExtracted={handleTextExtracted} />
          <TypingGame onComplete={handleGameComplete} text={gameText} />
        </div>
      </main>
    </div>
  );
}

export default App; 