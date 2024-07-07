import { THOMANN_BASE_URL, availableCurrency, stores } from '~/utils/const';
import { getBrowser } from './browser.service';
import type { ListItems, SingleItem } from '~/interfaces';
import { parseAmount } from '~/utils/parse-amount';
import { formatAmount } from '~/utils/format-amount';
import type { IError } from '~/interfaces/error-schema';
import { createErrorDocument } from '../errors/createErrorDocument';

export const getThomannSingleItem = async ({
  productPage,
}: {
  productPage: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  await page.goto(productPage);
  await page.waitForLoadState('domcontentloaded');

  const errorParams: Partial<IError> = {
    message: 'Error retrieving thomann single item data',
    store: stores.THOMANN,
    searchValue: productPage,
  };

  try {
    const itemData = await page.evaluate(() => {
      const actualPrice =
        document
          .querySelector('meta[itemprop="price"]')
          ?.getAttribute('content') ?? '';
      const itemName =
        document
          .querySelector('h1.product-title__title')
          ?.textContent?.trim() ?? '';
      const imgPath =
        document
          .querySelector('img.ZoomCurrentImage.spotlight__item-image')
          ?.getAttribute('src') ?? '';

      return { itemName, actualPrice, imgPath };
    });

    if (!itemData.actualPrice || !itemData.imgPath || !itemData.itemName) {
      await createErrorDocument({
        ...errorParams,
        responseMessage: `Couldn't retrieve actualPrice or imgPath or itemName`,
      });
      await browser.close();
      return null;
    }

    const parsedItem: SingleItem = {
      ...itemData,
      actualPrice: formatAmount(parseAmount(itemData.actualPrice)),
      currency: availableCurrency.EUR,
    };

    await browser.close();
    return parsedItem;
  } catch (err) {
    console.log('ERROR SCRAPPING THOMANN SINGLE ITEM', err);
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }
};

export const getThomannListItems = async ({
  querySearch,
}: {
  querySearch: string;
}) => {
  const browser = await getBrowser();

  const page = await browser.newPage();
  const url = `${THOMANN_BASE_URL}intl/search_dir.html?sw=${querySearch}`;

  const errorParams: Partial<IError> = {
    message: 'Error retrieving thomann list items',
    store: stores.THOMANN,
    searchValue: querySearch,
  };

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
    /*
     ** Have to replace the '.' since the dot is used for thousand separator and there are
     ** a lot of items without decimals, so the formatter thinks is a decimal separator
     ** instead of the thousand separator
     */
    const parsedItems: ListItems[] = listItems.map((item) => {
      const priceWithoutCurrencySign = item.price
        .replaceAll('€', '')
        .replaceAll('.', '')
        .trim();
      const parsedPrice = formatAmount(parseAmount(priceWithoutCurrencySign));
      return { ...item, price: parsedPrice, currency: availableCurrency.EUR };
    });

    await browser.close();
    return parsedItems;
  } catch (err) {
    console.log('ERROR SCRAPPING THOMANN LIST ITEMS', err);
    await createErrorDocument({
      ...errorParams,
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    });
    await browser.close();
    return null;
  }
};
