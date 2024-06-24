import { THOMANN_BASE_URL, availableCurrency } from '~/utils/const';
import { getBrowser } from './browser.service';
import type { ListItems, SingleItem } from '~/interfaces';
import { parseAmount } from '~/utils/parse-amount';
import { formatAmount } from '~/utils/format-amount';

export const getThomannSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  const itemData = await page.evaluate((el) => {
    const actualPrice =
      document
        .querySelector('meta[itemprop="price"]')
        ?.getAttribute('content') ?? '';
    const itemName =
      document.querySelector('h1.product-title__title')?.textContent?.trim() ??
      '';
    const imgPath =
      document
        .querySelector('img.ZoomCurrentImage.spotlight__item-image')
        ?.getAttribute('src') ?? '';

    return { itemName, actualPrice, imgPath };
  });

  const parsedItem: SingleItem = {
    ...itemData,
    currency: availableCurrency.EUR,
  };

  await browser.close();
  return parsedItem;
};

export const getThomannListItems = async ({
  querySearch,
}: {
  querySearch: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  const url = `${THOMANN_BASE_URL}intl/search_dir.html?sw=${querySearch}`;

  // let listItems = [];
  try {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');

    const listItems = await page.$$eval(
      'div.fx-product-list-entry',
      (items) => {
        return items.map((item) => {
          const productImage = item.querySelector('a.product__image');
          const url = productImage?.getAttribute('href') ?? '';
          const sourceElement = productImage?.querySelector('picture source');
          const imageUrl = sourceElement?.getAttribute('srcset') ?? '';

          const productContent = item.querySelector('a.product__content');
          const price =
            productContent?.querySelector('span.product__price-primary')
              ?.textContent ?? '';

          const manufacturer =
            productContent?.querySelector('.title__manufacturer')
              ?.textContent ?? '';
          const name =
            productContent?.querySelector('.title__name')?.textContent ?? '';
          const fullTitle = `${manufacturer} ${name}`.trim();

          return { name: fullTitle, imgPath: imageUrl, url, price };
        });
      }
    );
    const parsedItems: ListItems[] = listItems.map((item) => {
      const priceWithoutCurrencySign = item.price.replaceAll('€', '');
      const parsedPrice = formatAmount(parseAmount(priceWithoutCurrencySign));
      return { ...item, price: parsedPrice, currency: availableCurrency.EUR };
    });

    await browser.close();
    return parsedItems;
  } catch (err) {
    console.log('ERROR SCRAPPING THOMANN LIST ITEMS', err);
    await browser.close();
    return null;
  }
};
