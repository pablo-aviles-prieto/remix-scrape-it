import { AMAZON_BASE_URL, availableCurrency, stores } from '~/utils/const';
import { getBrowser } from './browser.service';
import type { IError } from '~/interfaces/error-schema';
import { createErrorDocument } from '../errors/create-error-document.service';
import { formatAmount } from '~/utils/format-amount';
import { parseAmount } from '~/utils/parse-amount';

const BASE_URL_WITHOUT_TRAILING_SLASH = AMAZON_BASE_URL.slice(0, -1);

export const getAmazonSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  const errorParams: Partial<IError> = {
    message: 'Error retrieving amazon single item data',
    store: stores.AMAZON,
    searchValue: productPage,
  };

  let itemData = null;

  try {
    const actualPrice = await page.$eval('span.a-price', (el) => {
      return el.querySelector('span.a-offscreen')?.textContent?.trim();
    });
    itemData = { actualPrice, discount: undefined, oldPrice: undefined };
  } catch {
    // If the price is not found, probably is because there isn't a variant selected
    await browser.close();
    return null;
  }

  try {
    const { discount, oldPrice } = await page.$eval(
      'div#corePriceDisplay_desktop_feature_div',
      (el) => {
        // Parsing from '-22 %' to '22%' the discount string
        const discount = el
          .querySelector('span.savingsPercentage')
          ?.textContent?.trim()
          ?.replace(/\s/g, '')
          ?.replace('-', '');
        const oldPrice = el
          .querySelector('span.a-price.a-text-price')
          ?.firstElementChild?.textContent?.trim();

        return { discount, oldPrice };
      }
    );
    itemData = { ...itemData, discount, oldPrice };
  } catch (err) {
    // Not doing nothing if discount not found
  }

  try {
    const titleElement = await page.$('span#productTitle');
    const itemName = (await titleElement?.textContent())?.trim() || undefined;

    const imgPath = await page.$eval(
      '#imgTagWrapperId img',
      (img) => (img as HTMLImageElement).src
    );

    itemData = { ...itemData, itemName, imgPath };
  } catch (err) {
    console.log('ERROR SCRAPPING AMAZON SINGLE ITEM', err);
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }

  const parsedItemData = {
    ...itemData,
    actualPrice: formatAmount(parseAmount(itemData.actualPrice ?? '')),
    currency: availableCurrency.EUR,
    ...(itemData?.oldPrice
      ? { oldPrice: formatAmount(parseAmount(itemData.oldPrice)) }
      : {}),
  };
  // Remove undefined properties from parsedItemData
  const cleanedItemData = Object.fromEntries(
    Object.entries(parsedItemData).filter(([_, v]) => v !== undefined)
  );

  await browser.close();
  return cleanedItemData;
};

export const getAmazonListItems = async ({
  querySearch,
}: {
  querySearch: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  const url = `${AMAZON_BASE_URL}s?k=${querySearch}`;

  let listItems = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    listItems = await page.$$eval(
      'div[data-component-type="s-search-result"]',
      (items) => {
        return items.map((item) => {
          const anchorElement = item.querySelector(
            'a.a-link-normal.s-no-outline'
          );
          const url = anchorElement?.getAttribute('href');
          const imgPath = anchorElement
            ?.querySelector('img')
            ?.getAttribute('src');

          const titleEl = item.querySelector('h2');
          const name = titleEl?.querySelector('span')?.textContent?.trim();

          const priceBlock = item.querySelector(
            'div.s-price-instructions-style'
          );
          const anchorPriceBlockEl = priceBlock?.querySelector('a');

          const spanPriceBlock =
            anchorPriceBlockEl?.querySelector('span.a-price');
          const divOldPriceBlock =
            anchorPriceBlockEl?.querySelector('div.a-section');

          const actualPrice = spanPriceBlock
            ?.querySelector('span.a-offscreen')
            ?.textContent?.trim()
            ?.replace('€', '')
            ?.replace(/\s/g, '');
          const oldPrice = divOldPriceBlock
            ?.querySelector('span.a-offscreen')
            ?.textContent?.trim()
            ?.replace('€', '')
            ?.replace(/\s/g, '');

          return {
            name,
            url,
            imgPath,
            price: oldPrice ? oldPrice : actualPrice,
            ...(oldPrice ? { discountedPrice: actualPrice } : {}),
          };
        });
      }
    );
  } catch (err) {
    const errorParams: Partial<IError> = {
      message: 'Error retrieving amazon list items',
      store: stores.AMAZON,
      searchValue: querySearch,
    };
    console.log('ERROR SCRAPPING AMAZON LIST ITEMS', err);
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }

  const parsedItems = listItems.map((item) => {
    let discountedPrice = item.discountedPrice;
    let discountPercent = null;
    if (item.discountedPrice) {
      discountedPrice = formatAmount(parseAmount(item.discountedPrice));
      const discountPrice = parseAmount(item.discountedPrice);
      const actualPrice = parseAmount(item.price ?? '0');

      // Calculate the discount percentage
      const discountPercentNumber =
        ((actualPrice - discountPrice) / actualPrice) * 100;
      discountPercent = `${Math.round(discountPercentNumber)}%`;
    }

    return {
      ...item,
      url: `${BASE_URL_WITHOUT_TRAILING_SLASH}${item.url}`,
      currency: availableCurrency.EUR,
      price: formatAmount(parseAmount(item.price ?? '')),
      ...(discountedPrice ? { discountedPrice } : {}),
      ...(discountPercent ? { discountPercent } : {}),
    };
  });

  await browser.close();
  return parsedItems;
};
