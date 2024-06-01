import { COOLMOD_BASE_RUL } from '~/utils/const';
import { getBrowser } from './browser.service';

export const getAliexpressSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  let itemData = undefined;

  await browser.close();
  return itemData;
};

export const getAliexpressListItems = async ({
  querySearch,
}: {
  querySearch: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  const url = `${COOLMOD_BASE_RUL}#01cc/fullscreen/m=and&q=${querySearch}`;

  let listItems: any[] = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    listItems = [];
  } catch (err) {
    console.log('ERROR SCRAPPING LIST ITEMS', err);
    await browser.close();
    return null;
  }

  // await browser.close();

  return listItems;
};
