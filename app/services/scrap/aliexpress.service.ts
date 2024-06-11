import {
  ALIEXPRESS_BASE_URL,
  DEFAULT_TIMEOUT_SELECTOR,
  SCRAP_ELEMENT_COUNT,
  availableCurrency,
} from '~/utils/const';
import { getBrowser } from './browser.service';
import { scrollIncrementally } from '~/utils/scroll-incrementally';
import type { Page } from 'playwright';
import { parseAliexpressPrice } from '~/utils/parse-aliexpress-price';
import type { ListItems } from '~/interfaces';

interface RawItemsProps {
  name: string;
  url: string;
  images: string[];
  rawPrice: string;
}

export const getAliexpressSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();

  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  // TODO: type it with SingleItem!
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
  const url = `${ALIEXPRESS_BASE_URL}w/wholesale-${querySearch}.html?g=y&spm=a2g0o.home.search.0`;

  let listItems: ListItems[] = [];
  let retryRetrieveData: boolean = true;
  let page: Page = await browser.newPage();
  let attempts = 0;
  const rawItems: RawItemsProps[] = [];

  // Adding condition to repeat at least 5 times if data wasnt retrieved. Closing and opening a new page
  while (retryRetrieveData && attempts < 5) {
    try {
      await page.goto(url);
      await page.waitForLoadState('domcontentloaded');

      await page.waitForSelector('div.search-item-card-wrapper-gallery', {
        timeout: DEFAULT_TIMEOUT_SELECTOR,
      });
      retryRetrieveData = false;
    } catch (err) {
      // Closing the page and open a new one
      await page.close();
      page = await browser.newPage();
      attempts++;
    }
  }

  if (attempts >= 5) {
    await browser.close();
    return null;
  }

  try {
    await scrollIncrementally(page);

    const items = await page.$$('div.search-item-card-wrapper-gallery');

    for (const item of items) {
      await item.scrollIntoViewIfNeeded();
      await page.waitForSelector('div[class^="images--imageWindow"] img', {
        timeout: DEFAULT_TIMEOUT_SELECTOR,
      });

      const itemData = await page.evaluate((item) => {
        console.log('test');
        const url =
          item.querySelector('a.search-card-item')?.getAttribute('href') || '';
        const parsedUrl = url?.replace(/^\/\//, '');

        const imageUrls = Array.from(
          item.querySelectorAll('div[class^="images--imageWindow"] img')
        )
          .map((img) => img.getAttribute('src'))
          .map((src) => (src ? src.replace(/^\/\//, 'https://') : null))
          .filter((src) => src !== null) as string[];

        const name =
          item
            .querySelector('div[class^="multi--title"]')
            ?.getAttribute('title') || '';

        const rawPrice = Array.from(
          item.querySelectorAll('div[class^="multi--price-sale"] span')
        )
          .map((span) => span.textContent)
          .join('');

        return {
          name,
          url: parsedUrl,
          images: imageUrls,
          rawPrice,
        };
      }, item);

      if (itemData.images.length > 0) {
        rawItems.push(itemData);
      }

      if (listItems.length >= SCRAP_ELEMENT_COUNT) {
        break;
      }
    }

    const rawItemsWithImages = rawItems.filter(
      (item) => item.images.length > 0
    );
    listItems = rawItemsWithImages.map((item) => ({
      name: item.name,
      url: `https://${item.url}`,
      imgPath: item.images[0],
      currency: availableCurrency.EUR,
      price: parseAliexpressPrice(item.rawPrice),
    }));
  } catch (err) {
    console.log('ERROR SCRAPPING LIST ITEMS', err);
    await browser.close();
    return null;
  }

  await browser.close();
  return listItems;
};
