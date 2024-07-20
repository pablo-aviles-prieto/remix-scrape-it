import { AMAZON_BASE_RUL, availableCurrency, stores } from '~/utils/const';
import { getBrowser } from './browser.service';
import type { IError } from '~/interfaces/error-schema';
import { createErrorDocument } from '../errors/create-error-document.service';
import { formatAmount } from '~/utils/format-amount';
import { parseAmount } from '~/utils/parse-amount';

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
        console.log('el', el);
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
    console.log('err', err);
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
  const url = `${AMAZON_BASE_RUL}s?k=${querySearch}`;

  // TODO: Remove any typing
  let listItems: any = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    // listItems = null
  } catch (err) {
    const errorParams: Partial<IError> = {
      message: 'Error retrieving amazon list items',
      store: stores.AMAZON,
      searchValue: querySearch,
    };
    console.log('ERROR SCRAPPING AMAZON LIST ITEMS', err);
    // await createErrorDocument({
    //   ...errorParams,
    //   responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    // });
    await browser.close();
    return null;
  }

  // await browser.close();
  return null;
};
