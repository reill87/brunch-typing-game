import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/extract-text', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL이 필요합니다.' });
    }

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // 불필요한 요소 제거
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('iframe').remove();
    $('noscript').remove();

    // 본문 텍스트 추출
    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500); // 500자로 제한

    res.json({ text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '텍스트 추출 중 오류가 발생했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 