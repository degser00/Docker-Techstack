import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.linkedin.com/login');
  console.log('Log in manually, then close the window when finished.');
  await page.waitForTimeout(60000);          // 1 min to log in
  await context.storageState({ path: 'cookies.json' });
  await browser.close();
  console.log('✅ cookies.json saved');
})();
