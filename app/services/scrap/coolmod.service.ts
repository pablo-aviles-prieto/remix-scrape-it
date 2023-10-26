import type { ElementHandle } from 'playwright';
import { getBrowser } from '../browser.service';

export const scrapCoolmod = async () => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto('https://www.coolmod.com/');
  await page.waitForLoadState('domcontentloaded');
  const inputElement = await page.$('#seek');
  await inputElement?.fill('RTX 4070');
  const siblingElement = await page.evaluateHandle((inputElement) => {
    return inputElement?.nextElementSibling as unknown as ElementHandle;
  }, inputElement);
  console.log('siblingElement', siblingElement);

  // await browser.close();
};
