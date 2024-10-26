import { COOLMOD_BASE_RUL, availableCurrency, stores } from '~/utils/const';
import { getBrowser } from './browser.service';
import { parseAmount } from '~/utils/parse-amount';
import { type Page } from 'playwright';
import { formatAmount } from '~/utils/format-amount';
import type { IError } from '~/interfaces/error-schema';
import { createErrorDocument } from '../errors/create-error-document.service';

/*
 ** The discount is calculated like 30 years after the DOM is rendered, so the only
 ** way to wait for it, is that the element disappears completely (when no discount applied)
 ** or to the d-none class to disappear in that exact element. If not, the discount retrieved
 ** is always 0,00 even when no discount exists, CMS things.
 */
async function waitForDiscountChange(page: Page) {
  // Wait for either the `!hidden` class to be removed or timeout after 3 seconds
  await page.waitForFunction(
    () => {
      const element = document.querySelector('div.discount-badge-product');
      return element && !element.classList.contains('!hidden');
    },
    undefined, // Argument for the function, if any (not used here)
    { timeout: 2000 } // Set timeout to 3 seconds
  );
}

export const getCoolmodSingleItem = async ({ productPage }: { productPage: string }) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  const errorParams: Partial<IError> = {
    message: 'Error retrieving coolmod single item data',
    store: stores.COOLMOD,
    searchValue: productPage,
  };

  try {
    await waitForDiscountChange(page);
  } catch (err) {
    console.log('discount change didnt happens', err);
  }

  const imgPath = await page.$eval('#section-product-gallery', gallery => {
    const firstImg = gallery.querySelector('img');
    return firstImg ? firstImg.src : null;
  });

  const itemData = await page.$eval(
    'div.col-span-12.lg\\:col-span-4.flex.flex-col.gap-2.relative',
    itemBlockData => {
      const itemName = itemBlockData.querySelector('h1.text-2xl.font-bold')?.textContent?.trim();
      const oldPrice = itemBlockData.querySelector('p.price-old-product')?.textContent?.trim();

      const priceWithoutDecimals = itemBlockData
        .querySelector('span.product_price.int_price')
        ?.textContent?.trim();
      const decimals = itemBlockData.querySelector('span.dec_price')?.textContent?.trim();
      const actualPrice = `${priceWithoutDecimals}.${decimals}`;

      const discount = itemBlockData
        .querySelector('div.discount-badge-product')
        ?.textContent?.trim();
      const parsedDiscount = discount?.replace('Dto. ', '')?.trim();
      return { itemName, oldPrice, actualPrice, discount: parsedDiscount };
    }
  );

  if (!imgPath || !itemData.itemName || !itemData.actualPrice) {
    console.log('No image path, or item name, or actual price found');
    await createErrorDocument({
      ...errorParams,
      responseMessage: 'No image path, or item name, or actual price found',
    });
    await browser.close();
    return null;
  }

  await browser.close();
  return {
    ...(itemData.oldPrice ? { oldPrice: formatAmount(parseAmount(itemData.oldPrice)) } : {}),
    actualPrice: formatAmount(parseAmount(itemData.actualPrice)),
    imgPath,
    itemName: itemData.itemName,
    currency: '€',
    discount: itemData.discount,
  };
};

export const getCoolmodListItems = async ({ querySearch }: { querySearch: string }) => {
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
      items => {
        const parsedItems = items.map(item => {
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

  const parsedListItems = listItems.map(item => ({
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
