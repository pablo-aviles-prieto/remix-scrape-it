import { COOLMOD_BASE_RUL, availableCurrency } from '~/utils/const';
import { getBrowser } from './browser.service';
import { parseAmount } from '~/utils/parse-amount';
import { type Page } from 'playwright';
import { formatAmount } from '~/utils/format-amount';

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
    { timeout: 30000 }
  ); // is the default timeout
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
  await waitForDiscountChange(page);

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

  await browser.close();
  return {
    ...itemData,
    ...(itemData?.oldPrice
      ? { oldPrice: formatAmount(parseAmount(itemData.oldPrice)) }
      : {}),
    actualPrice: formatAmount(parseAmount(itemData.actualPrice ?? '')),
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
