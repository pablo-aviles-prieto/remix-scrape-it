import { ALIEXPRESS_BASE_URL } from '~/utils/const';
import { getBrowser } from './browser.service';
import { scrollPageByPercentage } from '~/utils/scroll-page-by-percentage';

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
  const url = `${ALIEXPRESS_BASE_URL}w/wholesale-${querySearch}.html?spm=a2g0o.home.search.0`;

  let listItems: any[] = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('div.search-item-card-wrapper-gallery', {
      timeout: 5000,
    });
    // Scroll down at least 35% of the page height
    await scrollPageByPercentage({ page, percentage: 35 });

    const itemsList = await page.$$eval(
      'div.search-item-card-wrapper-gallery',
      (items) => {
        return items.map((item) => {
          const url = item
            .querySelector('a.search-card-item')
            ?.getAttribute('href');
          const parsedUrl = url?.replace(/^\/\//, '');
          return { url: parsedUrl };
        });
      }
    );
    console.log('itemsList', itemsList);

    listItems = [];
  } catch (err) {
    console.log('ERROR SCRAPPING LIST ITEMS', err);
    await browser.close();
    return null;
  }

  // await browser.close();

  return listItems;
};
