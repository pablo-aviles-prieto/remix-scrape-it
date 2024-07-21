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

  let listItems = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    // Scroll down to the bottom of the page to get he lazy images
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        const distance = 100; // should be less than or equal to window.innerHeight
        const delay = 100; // milliseconds

        const scrollInterval = setInterval(() => {
          const { scrollHeight, scrollTop, clientHeight } =
            document.documentElement;
          if (scrollTop + clientHeight >= scrollHeight) {
            clearInterval(scrollInterval);
            resolve();
          }
          window.scrollBy(0, distance);
        }, delay);
      });
    });

    listItems = await page.$$eval('div.col.list-item', (items) => {
      return items.map((item) => {
        const anchorElement = item.querySelector('a.click-layer');
        const url = anchorElement?.getAttribute('href');
        const name = anchorElement?.getAttribute('aria-label');
        const img = item
          .querySelector('img.img-block.img-fluid')
          ?.getAttribute('src');
        const rawPrice = item.querySelector('span.price')?.textContent?.trim();
        const rawDiscountedPrice = item
          .querySelector('span.price.crossed')
          ?.textContent?.trim();

        // Checking if i.icon-promo-code exists inside item-label, in that case, it means that
        // the item-label content is a discount
        const rawDiscountPercent = item.querySelector(
          'div.item-label i.icon-promo-code'
        )
          ? item.querySelector('div.item-label')?.textContent?.trim()
          : null;

        return {
          url,
          name,
          imgPath: `https:${img}`,
          price: rawPrice?.replace('€', ''),
          ...(rawDiscountedPrice
            ? { discountedPrice: rawDiscountedPrice.replace('€', '') }
            : {}),
          ...(rawDiscountPercent
            ? {
                discountPercent: rawDiscountPercent
                  .replace('DE DESCUENTO', '')
                  .trim(),
              }
            : {}),
        };
      });
    });
  } catch (err) {
    const errorParams: Partial<IError> = {
      message: 'Error retrieving prozis list items',
      store: stores.PROZIS,
      searchValue: querySearch,
    };
    console.log('ERROR SCRAPPING PROZIS LIST ITEMS', err);
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
    currency: availableCurrency.EUR,
    url: `${PROZIS_BASE_RUL}${(item.url as string).substring(1)}`,
  }));
  return parsedListItems;
};
