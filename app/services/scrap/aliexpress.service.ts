import { ALIEXPRESS_BASE_URL } from '~/utils/const';
import { getBrowser } from './browser.service';
import { scrollPageByPercentage } from '~/utils/scroll-page-by-percentage';

// TODO: Delete if not used.
const key = '@shipto@temporary';
const value = JSON.stringify({
  provinceRes: {
    children: [
      {
        code: '919971656567000000',
        hasChildren: true,
        i18nMap: {},
        id: 919971656567000000,
        language: 'ES',
        level: 2,
        name: 'A Coruña',
        type: 'PROVINCE',
      },
    ],
    code: 'ES',
    hasChildren: true,
    i18nMap: {
      cityNavTitle: 'Municipio',
      provinceNavTitle: 'Provincia',
      tipBegin:
        '¿Tienes problemas para encontrar el municipio, provincia o calle?',
      tipLink: 'https://survey.alibaba.com/survey/AM7tUvhym',
      tipEnd: 'Haz clic y cuéntanoslo',
    },
    id: 199,
    language: 'ES',
    level: 1,
    name: 'España',
    type: 'COUNTRY',
  },
  cityRes: {
    children: [
      {
        code: '919971656567047000',
        hasChildren: false,
        i18nMap: {},
        id: 919971656567047000,
        language: 'ES',
        level: 3,
        name: 'A Baña',
        type: 'CITY',
      },
    ],
    code: '919971656567000000',
    hasChildren: true,
    i18nMap: {
      cityNavTitle: 'Municipio',
      provinceNavTitle: 'Provincia',
      tipBegin:
        '¿Tienes problemas para encontrar el municipio, provincia o calle?',
      tipLink: 'https://survey.alibaba.com/survey/AM7tUvhym',
      tipEnd: 'Haz clic y cuéntanoslo',
    },
    id: 919971656567000000,
    language: 'ES',
    level: 2,
    name: 'A Coruña',
    type: 'PROVINCE',
  },
  _id: 'country_ES;province_919971656567000000',
});

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

  // const context = await browser.newContext({
  //   // Setting headers to simulate a request from Spain
  //   extraHTTPHeaders: {
  //     'Accept-Language': 'es-ES,es;q=0.9',
  //     Referer: 'https://www.aliexpress.com/',
  //   },
  // });
  // const page = await context.newPage();

  const page = await browser.newPage();
  const url = `${ALIEXPRESS_BASE_URL}w/wholesale-${querySearch}.html?spm=a2g0o.home.search.0`;

  // TODO: type it correctly
  let listItems: any[] = [];
  try {
    await page.goto(url);
    // Set the localStorage key-value pair before navigating to the page
    await page.evaluate(
      ({ key, value }: { key: string; value: string }) => {
        localStorage.setItem(key, value);
      },
      { key, value }
    );
    await page.waitForLoadState('domcontentloaded');
    // Scroll down at least 35% of the page height
    await page.waitForTimeout(300);
    await scrollPageByPercentage({ page, percentage: 10 });
    await page.waitForTimeout(500);
    await scrollPageByPercentage({ page, percentage: 15 });
    await page.waitForTimeout(500);
    await scrollPageByPercentage({ page, percentage: 20 });
    await page.waitForTimeout(500);
    await scrollPageByPercentage({ page, percentage: 25 });
    await page.waitForTimeout(500);
    await scrollPageByPercentage({ page, percentage: 30 });

    // TODO: Check if the search didnt throw results to retry
    // Sorry, your search "iphone 15" did not match any products. Please try again.

    // TODO: It should be checked only the wait for selector of search-item-card-wrapper-gallery
    // and in case that it fails, retry closing the browser and opening a new one in case it failed
    // await page.waitForSelector('div.search-item-card-wrapper-gallery', {
    //   timeout: 5000,
    // });

    // TODO: Keep getting data
    const itemsList = await page.$$eval(
      'div.search-item-card-wrapper-gallery',
      (items) => {
        return items.map((item) => {
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

    console.log('itemsList length', itemsList.length);
    const itemsWithImages = itemsList.filter((item) => item.images.length > 0);
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
