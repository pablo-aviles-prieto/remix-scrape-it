import { ALIEXPRESS_BASE_URL, SCRAP_ELEMENT_COUNT } from '~/utils/const';
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

  // TODO: type it with SingleItem
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

  // TODO: type it correctly with ListItems
  let listItems: any[] = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    // TODO: Check if the search didnt throw results to retry
    // No se han encontrado resultados para tu búsqueda de "iphone 15". Inténtalo de nuevo.
    await page.waitForSelector('div.search-item-card-wrapper-gallery');
    await scrollIncrementally(page);

    const items = await page.$$('div.search-item-card-wrapper-gallery');

    for (const item of items) {
      await item.scrollIntoViewIfNeeded();
      await page.waitForSelector('div[class^="images--imageWindow"] img', {
        timeout: 5000,
      });

      const itemData = await page.evaluate((item) => {
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
      }, item);

      if (itemData.images.length > 0) {
        listItems.push(itemData);
      }

      // Maybe there are less items than TARGET_ELEMENT_COUNT, CHECK IT
      if (listItems.length >= SCRAP_ELEMENT_COUNT) {
        break;
      }
    }

    console.log('itemsList', listItems);
    console.log('itemsList length', listItems.length);
    const itemsWithImages = listItems.filter((item) => item.images.length > 0);
    console.log('itemsWithImages length', itemsWithImages.length);

    listItems = [];
  } catch (err) {
    console.log('ERROR SCRAPPING LIST ITEMS', err);
    await browser.close();
    return null;
  }

  // await browser.close();

  return listItems;
};
