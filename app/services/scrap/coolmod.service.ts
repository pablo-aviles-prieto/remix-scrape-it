import { getBrowser } from '../browser.service';

export const scrapCoolmod = async () => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto('https://www.coolmod.com/');
  await page.waitForTimeout(5000);

  await browser.close();
};
