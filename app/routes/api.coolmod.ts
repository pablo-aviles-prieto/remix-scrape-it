import { type ActionFunctionArgs, json } from '@remix-run/node';
import { scrapCoolmod } from '~/services/scrap/coolmod.service';
import type { ItemCoolmod } from '~/interfaces/ItemCoolmod';

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryUrl = url.searchParams.get('url');

  if (!queryUrl) {
    console.log('NO URL QUERY PARAM DETECTED');
    return json({ ok: false, error: 'No query param URL detected' }, 400);
  }

  let scrapResponse: ItemCoolmod = undefined;
  try {
    scrapResponse = await scrapCoolmod({ productPage: queryUrl ?? '' });
  } catch (err) {
    console.log(err);
  }

  return json({ ok: true, data: scrapResponse }, 200);
};
