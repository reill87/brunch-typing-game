import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// 특수문자 제거 함수
const removeSpecialCharacters = (text: string): string => {
  return text
    .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/g, '') // 한글, 영문, 숫자, 공백만 남기고 제거
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .trim();
};

app.post('/api/extract-text', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL이 필요합니다.' });
    }

    // 브런치 URL인지 확인
    if (!url.includes('brunch.co.kr')) {
      return res.status(400).json({ error: '브런치 사이트의 URL만 지원합니다.' });
    }

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // 제목 추출 및 특수문자 제거
    const title = removeSpecialCharacters($('.cover_title').text().trim());
    
    // 본문 추출 및 특수문자 제거
    const content = removeSpecialCharacters($('.wrap_body').text().trim());

    if (!title || !content) {
      return res.status(400).json({ error: '텍스트를 추출할 수 없습니다.' });
    }

    // 제목과 본문을 결합
    const text = `${title}\n\n${content}`;

    res.json({ text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '텍스트 추출 중 오류가 발생했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 