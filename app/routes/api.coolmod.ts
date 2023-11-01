import { type ActionFunctionArgs, json } from '@remix-run/node';
import {
  getCoolmodListItems,
  getCoolmodSingleItem,
} from '~/services/scrap/coolmod.service';
import type {
  SingleItemCoolmod,
  ListItemsCoolmod,
} from '~/interfaces/item-coolmod';
import { errorMsgs } from '~/utils/const';

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryUrl = url.searchParams.get('url');
  const queryWord = url.searchParams.get('query');

  if (!queryUrl && !queryWord) {
    return json({ ok: false, error: errorMsgs.internalError }, 500);
  }

  let scrapResponse: SingleItemCoolmod | ListItemsCoolmod[] | undefined =
    undefined;

  if (queryUrl) {
    try {
      scrapResponse = await getCoolmodSingleItem({
        productPage: queryUrl,
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      scrapResponse = await getCoolmodListItems({
        querySearch: queryWord ?? '',
      });
    } catch (err) {
      console.log(err);
    }
  }

  return json({ ok: true, data: scrapResponse }, 200);
};
