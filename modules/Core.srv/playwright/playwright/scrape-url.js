
import express from 'express';
import { chromium } from 'playwright';
import fs from 'fs';

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  const browser = await chromium.launch({ headless: true });

  // Only use cookies.json if it exists and is valid
  let context;
  if (fs.existsSync('cookies.json')) {
    try {
      const state = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
      context = await browser.newContext({ storageState: state });
    } catch {
      context = await browser.newContext(); // fallback
    }
  } else {
    context = await browser.newContext();
  }

  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const title = await page.title();
    const text = await page.textContent('body');
    res.json({ title, snippet: text.substring(0, 500) });
  } catch (err) {
    console.error('Scrape failed:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    await browser.close();
  }
});

app.listen(3000, () => console.log('✅ Scraper running on port 3000'));
