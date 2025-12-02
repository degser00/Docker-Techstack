import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login');
  console.log('🧑‍💻 Log in manually, then close the browser window when done.');

  await page.waitForTimeout(60000); // 60 seconds to log in manually
  await context.storageState({ path: 'cookies.json' });
  await browser.close();

  console.log('✅ Login session saved to cookies.json');
})();
