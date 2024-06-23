import { THOMANN_BASE_URL } from '~/utils/const';
import { getBrowser } from './browser.service';

export const getThomannSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  // let itemData = undefined;

  // await browser.close();
  return null;
};

export const getThomannListItems = async ({
  querySearch,
}: {
  querySearch: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  const url = `${THOMANN_BASE_URL}intl/search_dir.html?sw=${querySearch}`;

  let listItems = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    listItems = await page.$$eval('div.fx-product-list-entry', (items) => {
      const parsedItems = items.map((item) => {
        const productImage = item.querySelector('a.product__image');
        const url = productImage?.getAttribute('href');

        const sourceElement = productImage?.querySelector('picture source');
        const imageUrl = sourceElement?.getAttribute('srcset');

        return { imgPath: imageUrl, url };
      });
      return parsedItems;
    });
    console.log('listItems', listItems);
  } catch (err) {
    console.log('ERROR SCRAPPING THOMANN LIST ITEMS', err);
    await browser.close();
    return null;
  }

  // await browser.close();
  return null;
};
