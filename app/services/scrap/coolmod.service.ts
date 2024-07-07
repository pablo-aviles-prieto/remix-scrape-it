import { COOLMOD_BASE_RUL, availableCurrency, stores } from '~/utils/const';
import { getBrowser } from './browser.service';
import { parseAmount } from '~/utils/parse-amount';
import { type Page } from 'playwright';
import { formatAmount } from '~/utils/format-amount';
import type { IError } from '~/interfaces/error-schema';
import { createErrorDocument } from '../errors/createErrorDocument';

/*
 ** The discount is calculated like 30 years after the DOM is rendered, so the only
 ** way to wait for it, is that the element disappears completely (when no discount applied)
 ** or to the d-none class to disappear in that exact element. If not, the discount retrieved
 ** is always 0,00 even when no discount exists, CMS things.
 */
async function waitForDiscountChange(page: Page) {
  // Wait for either the `d-none` class to be removed or the element to be removed
  await page.waitForFunction(
    () => {
      const element = document.querySelector('.discount');
      return !element || !element.classList.contains('d-none');
    },
    undefined, // The 2nd argument is an arg passed to the function of the 1st arg
    { timeout: 10000 } // the timeout option obj is the 3rd arg
  );
}

export const getCoolmodSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  const errorParams: Partial<IError> = {
    message: 'Error retrieving coolmod single item data',
    store: stores.COOLMOD,
    searchValue: productPage,
  };

  // Check if the class productrightpadding exists, if not it means that
  // there is no price info for the product
  const productRightPaddingExists = await page.$('.productrightpadding');
  if (!productRightPaddingExists) {
    await browser.close();
    return null;
  }

  try {
    await waitForDiscountChange(page);
  } catch (err) {
    console.log('discount change didnt happens', err);
  }

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
        return { amount };
      }
    );
    const actualPrice =
      (await inputElement?.getAttribute('data-itemprice')) || undefined;

    const discountElement = await page.$('.ratebox');
    const discount =
      (await discountElement?.textContent())?.trim() || undefined;

    itemData = {
      oldPrice: oldPrice.amount,
      actualPrice,
      itemName,
      currency: availableCurrency.EUR,
      imgPath,
      discount,
    };
  } catch (err) {
    // Meaning the product doesnt have a discount
  }

  try {
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
        currency: availableCurrency.EUR,
        imgPath,
      };
    }
  } catch (err) {
    // If this error happens it means that didnt find an oldPrice (#discountProductPrice .crossout)
    // and also, didnt find the selector for actualPrice (#normalpriceproduct), so we just close the browser
    console.log('ERROR SCRAPPING COOLMOD SINGLE ITEM', err);
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }

  await browser.close();
  return {
    ...itemData,
    ...(itemData?.oldPrice
      ? { oldPrice: formatAmount(parseAmount(itemData.oldPrice)) }
      : {}),
    actualPrice: formatAmount(parseAmount(itemData?.actualPrice ?? '')),
  };
};

export const getCoolmodListItems = async ({
  querySearch,
}: {
  querySearch: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  const url = `${COOLMOD_BASE_RUL}#01cc/fullscreen/m=and&q=${querySearch}`;

  let listItems = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('div.dfd-results-grid', { timeout: 5000 });

    listItems = await page.$$eval(
      'div.dfd-card.dfd-card-preset-product.dfd-card-type-indiceproductos',
      (items) => {
        const parsedItems = items.map((item) => {
          const url = item.getAttribute('dfd-value-link');
          const imgPath = item
            .querySelector('.dfd-card-thumbnail img')
            ?.getAttribute('src')
            ?.replace('normal', 'large');
          const name = item
            .querySelector('.dfd-card-title')
            ?.textContent?.trim();
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
  } catch (err) {
    const errorParams: Partial<IError> = {
      message: 'Error retrieving coolmod list items',
      store: stores.COOLMOD,
      searchValue: querySearch,
    };
    console.log('ERROR SCRAPPING COOLMOD LIST ITEMS', err);
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }

  await browser.close();

  const parsedListItems = listItems.map((item) => ({
    ...item,
    price: formatAmount(parseAmount(item.price ?? '')),
    currency: availableCurrency.EUR,
    ...(item.discountedPrice
      ? {
          discountedPrice: formatAmount(parseAmount(item.discountedPrice)),
        }
      : {}),
  }));
  return parsedListItems;
};
