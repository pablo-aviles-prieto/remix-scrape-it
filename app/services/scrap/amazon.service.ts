import { AMAZON_BASE_RUL, stores } from '~/utils/const';
import { getBrowser } from './browser.service';
import type { IError } from '~/interfaces/error-schema';
import { createErrorDocument } from '../errors/create-error-document.service';

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

  let itemData = undefined;

  try {
    const titleElement = await page.$('span#productTitle');
    const itemName = (await titleElement?.textContent())?.trim() || undefined;

    itemData = { itemName };
  } catch (err) {
    console.log('ERROR SCRAPPING AMAZON SINGLE ITEM', err);
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }

  console.log('itemData', itemData);

  // await browser.close();
  return null;
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
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }

  // await browser.close();
  return null;
};
