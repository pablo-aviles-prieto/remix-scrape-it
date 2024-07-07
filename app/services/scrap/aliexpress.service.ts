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
import type { ListItems, SingleItem } from '~/interfaces';

interface RawItemsProps {
  name: string;
  url: string;
  images: string[];
  rawPrice: string;
}

const changeLanguageAndCurrency = async (page: Page) => {
  const clickOnCurrencySelector = await page.$(
    'div[class*="ship-to--menuItem"]'
  );
  clickOnCurrencySelector?.click();
  await page.waitForSelector('div[class*="saveBtn"]');
  const saveBtnElement = await page.$('div[class*="saveBtn"]');

  await page.evaluate(async (saveBtnElement) => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const elements = Array.from(
      document.querySelectorAll('div[class*="form-item--title"]')
    );
    const sendToElement =
      elements.find((element) => element.textContent?.trim() === 'Enviar a') ||
      null;
    const countrySelect = sendToElement?.nextElementSibling
      ?.firstElementChild as HTMLElement;
    // Opening the country select input
    (countrySelect?.firstElementChild as HTMLElement)?.click();

    const selectOptions = countrySelect?.lastElementChild as HTMLElement;
    const options = Array.from(selectOptions.children);
    const targetOption = options.find((option) =>
      option?.textContent?.includes('España')
    ) as HTMLElement;
    targetOption?.click();

    await delay(100);
    (saveBtnElement as HTMLElement)?.click();
  }, saveBtnElement);
};

export const getAliexpressSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  let itemData: SingleItem | null = null;

  try {
    await changeLanguageAndCurrency(page);

    const newPage = await context.newPage();
    await newPage.goto(productPage);
    await newPage.waitForLoadState('domcontentloaded');

    const actualPrice = await page.$eval('.product-price-value', (el) => {
      return el.textContent?.trim();
    });

    const itemName = await page.$eval('h1[data-pl]', (el) =>
      el.textContent?.trim()
    );

    const imgPath = await page.$eval('img[class*="magnifier--image--"]', (el) =>
      el.getAttribute('src')
    );

    itemData = {
      actualPrice: parseAliexpressPrice(actualPrice ?? ''),
      itemName,
      currency: availableCurrency.EUR,
      imgPath: imgPath ?? '',
    };
  } catch (err) {
    // TODO: add error on DB
    console.log('error retrieving data', err);
    return null;
  }

  // Retrieving the possible oldPrice and discount
  try {
    const { oldPrice, discount } = await page.$eval(
      'div[class*="price--original--"]',
      (el) => {
        const spans = el.querySelectorAll('span');
        const oldPrice = spans[0]?.textContent?.trim() || null;
        const discount =
          spans[1]?.textContent?.trim().replace('-', '').replace(' dto.', '') ||
          null;
        return { oldPrice, discount };
      }
    );
    itemData =
      itemData && oldPrice && discount
        ? { ...itemData, oldPrice: parseAliexpressPrice(oldPrice), discount }
        : itemData;
  } catch (err) {
    // Not retrieving discount and oldPrice, so moving on
  }

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
  let attempts = 0;
  const rawItems: RawItemsProps[] = [];

  const context = await browser.newContext();
  let page: Page;
  try {
    const originalPage = await context.newPage();
    await originalPage.goto(url);
    await originalPage.waitForLoadState('domcontentloaded');
    await changeLanguageAndCurrency(originalPage);
    page = await context.newPage();
  } catch (err) {
    // Failing to select the new language and currency on changeLanguageAndCurrency helper
    // TODO: add error on DB
    await browser.close();
    return null;
  }

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
      page = await context.newPage();
      attempts++;
    }
  }

  if (attempts >= 5) {
    // TODO: add error on DB
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
    console.log('ERROR SCRAPPING ALIEXPRESS LIST ITEMS', err);
    // TODO: add error on DB
    await browser.close();
    return null;
  }

  await browser.close();
  return listItems;
};
