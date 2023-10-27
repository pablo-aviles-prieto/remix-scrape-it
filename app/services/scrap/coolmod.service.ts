import { getBrowser } from '../browser.service';
import type { ItemCoolmod } from '~/interfaces/ItemCoolmod';

export const scrapCoolmod = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  let itemData: ItemCoolmod = undefined;
  const inputElement = await page.$('#layerdt');
  const itemName =
    (await inputElement?.getAttribute('data-itemname')) || undefined;
  try {
    const oldPrice = await page.$eval(
      '#discountProductPrice .crossout',
      (el) => {
        const amount = el.querySelector('#oldprice')?.textContent?.trim();
        const currency = el.textContent?.replace(amount ?? '', '').trim();
        return { amount, currency };
      }
    );
    const actualPrice =
      (await inputElement?.getAttribute('data-itemprice')) || undefined;

    itemData = {
      oldPrice: oldPrice.amount,
      actualPrice,
      itemName,
      currency: oldPrice.currency,
    };
  } catch (err) {
    // Meaning the product doesnt have a discount
  }

  if (!itemData?.oldPrice) {
    const actualPrice = await page.$eval('#normalpriceproduct', (el) => {
      const amount = el
        .querySelector('#normalpricenumber')
        ?.textContent?.trim();
      const currency = el.textContent?.replace(amount ?? '', '').trim();
      return { amount, currency };
    });

    itemData = {
      actualPrice: actualPrice.amount,
      itemName,
      currency: actualPrice.currency,
    };
  }

  await browser.close();

  return itemData;
};
