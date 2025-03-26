import React, { useState } from 'react';
import './UrlInput.css';

interface UrlInputProps {
  onTextExtracted: (text: string) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onTextExtracted }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/extract-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '텍스트 추출에 실패했습니다.');
      }

      onTextExtracted(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="url-input-form">
      <div className="url-input-container">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="웹사이트 주소를 입력하세요"
          required
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '추출 중...' : '텍스트 추출'}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default UrlInput; 