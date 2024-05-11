import { COOLMOD_BASE_RUL, availableCurrency } from '~/utils/const';
import { getBrowser } from './browser.service';
import { transformDecimalOperator } from '~/utils/transform-decimal-operator';
import { parseAmount } from '~/utils/parse-amount';

export const getCoolmodSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  let itemData = undefined;
  const inputElement = await page.$('#layerdt');
  const itemName =
    (await inputElement?.getAttribute('data-itemname')) || undefined;

  const imgElement = await page.$('#productmainimageitem');
  const imgPath = (await imgElement?.getAttribute('src')) || undefined;

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

    const discountElement = await page.$('.ratebox');
    const discount =
      (await discountElement?.textContent())?.trim() || undefined;

    itemData = {
      oldPrice: oldPrice.amount,
      actualPrice, // Returned in JS number (2399.95 instead of 2.399,95)
      itemName,
      currency: oldPrice.currency,
      imgPath,
      discount,
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
      actualPrice: transformDecimalOperator(actualPrice.amount ?? ''),
      itemName,
      currency: actualPrice.currency,
      imgPath,
    };
  }

  await browser.close();
  return itemData;
};

export const getCoolmodListItems = async ({
  querySearch,
}: {
  querySearch: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  const url = `${COOLMOD_BASE_RUL}#01cc/fullscreen/m=and&q=${querySearch}`;

  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('div.dfd-results-grid');

  const listItems = await page.$$eval(
    'div.dfd-card.dfd-card-preset-product.dfd-card-type-indiceproductos',
    (items) => {
      const parsedItems = items.map((item) => {
        const url = item.getAttribute('dfd-value-link');
        const imgPath = item
          .querySelector('.dfd-card-thumbnail img')
          ?.getAttribute('src')
          ?.replace('normal', 'large');
        const name = item.querySelector('.dfd-card-title')?.textContent?.trim();
        const discountedPrice = item
          .querySelector('.dfd-card-price.dfd-card-price--sale')
          ?.getAttribute('data-value')
          ?.trim();
        const normalPrice = item
          .querySelector('.dfd-card-price:not(.dfd-card-price--sale)')
          ?.getAttribute('data-value')
          ?.trim();
        const discountPercent = item
          .querySelector('div.dfd-card-flags .dfd-card-flag')
          ?.getAttribute('data-discount')
          ?.trim();

        return {
          name,
          url,
          imgPath,
          price: normalPrice,
          ...(discountedPrice ? { discountedPrice } : {}),
          ...(discountPercent ? { discountPercent } : {}),
        };
      });
      return parsedItems;
    }
  );

  await browser.close();

  const parsedListItems = listItems.map((item) => ({
    ...item,
    price: parseAmount(item.price ?? ''),
    currency: availableCurrency.EUR,
    ...(item.discountedPrice
      ? { discountedPrice: parseAmount(item.discountedPrice ?? '') }
      : {}),
  }));
  return parsedListItems;
};
