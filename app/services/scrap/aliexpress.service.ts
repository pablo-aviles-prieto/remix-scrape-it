import { ALIEXPRESS_BASE_URL } from '~/utils/const';
import { getBrowser } from './browser.service';
import { scrollIncrementally } from '~/utils/scroll-incrementally';

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
  const url = `${ALIEXPRESS_BASE_URL}w/wholesale-${querySearch}.html?g=y&spm=a2g0o.home.search.0`;

  // TODO: type it correctly
  let listItems: any[] = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    // TODO: Check if the search didnt throw results to retry
    // Sorry, your search "iphone 15" did not match any products. Please try again.

    await page.waitForSelector('div.search-item-card-wrapper-gallery', {
      timeout: 5000,
    });

    await scrollIncrementally(page);

    // TODO: Iterate each of the items, scroll into view if needed and wait for the image
    // TODO: Keep getting data!
    const itemsList = await page.$$eval(
      'div.search-item-card-wrapper-gallery',
      (items) => {
        return items.map(async (item) => {
          item.scrollIntoView();
          await page.waitForSelector('div[class^="images--imageWindow"] img');

          const url = item
            .querySelector('a.search-card-item')
            ?.getAttribute('href');
          const parsedUrl = url?.replace(/^\/\//, '');

          const imageUrls = Array.from(
            item.querySelectorAll('div[class^="images--imageWindow"] img')
          )
            .map((img) => img.getAttribute('src'))
            .map((src) => (src ? src.replace(/^\/\//, 'https://') : null))
            .filter((src) => src !== null);
          return { url: parsedUrl, images: imageUrls };
        });
      }
    );

    console.log('itemsList', itemsList);
    console.log('itemsList length', itemsList.length);
    // const itemsWithImages = itemsList.filter((item) => item.images.length > 0);
    // console.log('itemsWithImages length', itemsWithImages.length);

    listItems = [];
  } catch (err) {
    console.log('ERROR SCRAPPING LIST ITEMS', err);
    await browser.close();
    return null;
  }

  // await browser.close();

  return listItems;
};
