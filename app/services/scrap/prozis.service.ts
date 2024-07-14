import { availableCurrency, PROZIS_BASE_RUL, stores } from '~/utils/const';
import { getBrowser } from './browser.service';
import type { IError } from '~/interfaces/error-schema';
import { createErrorDocument } from '../errors/create-error-document.service';

export const getProzisSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  const errorParams: Partial<IError> = {
    message: 'Error retrieving prozis single item data',
    store: stores.PROZIS,
    searchValue: productPage,
  };

  let itemData = undefined;

  try {
    await page.waitForSelector('div.info-main.info-extras', { timeout: 5000 });
    itemData = null;

    const productData = await page.$eval('div.info-main.info-extras', (el) => {
      console.log('el', el);
      const itemName = el.querySelector('p.product-name')?.textContent?.trim();
      const oldPrice = el.querySelector('p.crossed-price')?.textContent?.trim();
      const actualPrice = el
        .querySelector('p.final-price')
        ?.textContent?.trim();
      return { itemName, actualPrice, ...(oldPrice ? { oldPrice } : {}) };
    });
    const imgSrc = await page.$eval(
      'div.gallery-block.main-block picture img',
      (img) => {
        return img.getAttribute('src');
      }
    );

    itemData = {
      ...productData,
      imgPath: `https:${imgSrc}`,
    };
  } catch (err) {
    console.log('ERROR SCRAPPING PROZIS SINGLE ITEM', err);
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }

  try {
    const discount = await page.$eval('div.prz-blk-promo-content', (el) => {
      return el
        .querySelector('div.prz-blk-content-elem.prz-blk-promo-title span')
        ?.textContent?.trim();
    });
    itemData = { ...itemData, discount };
  } catch (err) {
    // Meaning there is no discount block in the page
  }

  const parsedPrice = itemData.actualPrice?.replaceAll('€', '');
  const parsedItem = {
    ...itemData,
    actualPrice: parsedPrice,
    currency: availableCurrency.EUR,
  };

  await browser.close();
  return parsedItem;
};

export const getProzisListItems = async ({
  querySearch,
}: {
  querySearch: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  const url = `${PROZIS_BASE_RUL}es/es/search?text=${querySearch}`;

  // TODO: Remove the any type
  let listItems: any[] = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    listItems = [];
  } catch (err) {
    const errorParams: Partial<IError> = {
      message: 'Error retrieving prozis list items',
      store: stores.PROZIS,
      searchValue: querySearch,
    };
    console.log('ERROR SCRAPPING PROZIS LIST ITEMS', err);
    // await createErrorDocument({
    //   ...errorParams,
    //   responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    // });
    // await browser.close();
    return null;
  }

  // await browser.close();

  // return listItems;
  return null;
};
