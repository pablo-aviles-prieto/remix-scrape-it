import { type ActionFunctionArgs, json } from '@remix-run/node';
import TrackingModel from '~/models/trackings';
import { stores, errorMsgs } from '~/utils/const';

type Payload = {
  name: string;
  url: string;
  image: string;
  currency: string;
  actualPrice: string;
  store: stores;
};

export async function action({ request }: ActionFunctionArgs) {
  const rawData = await request.text();
  const { name, url, image, currency, actualPrice, store } = JSON.parse(
    rawData
  ) as Payload;

  if (!name || !url || !image || !currency || !actualPrice || !store) {
    return json({ ok: false, error: errorMsgs.invalidPayload }, 400);
  }

  let query = {};
  // If its Amazon store, I dont want to check by the name, since the different
  // variants share the same name, but different urls
  if (store === stores.AMAZON) {
    query = { url };
  } else {
    query = { $or: [{ name }, { url }] };
  }

  const itemExists = await TrackingModel.findOne(query);

  if (!itemExists) {
    const createdTracking = await TrackingModel.create({
      name,
      url,
      image,
      currency,
      prices: [
        {
          date: new Date(),
          price: actualPrice,
        },
      ],
      store,
      lastSubscriberUpdate: new Date(),
    });
    return json({ ok: true, insertedId: createdTracking.id }, 201);
  } else {
    return json({ ok: true, insertedId: itemExists.id }, 202);
  }
}

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryName = url.searchParams.get('name');
  const queryUrl = url.searchParams.get('url');
  const queryStore = url.searchParams.get('store');

  if (!queryUrl || !queryName || !queryStore) {
    return json(
      {
        ok: false,
        error: errorMsgs.invalidParams,
      },
      400
    );
  }

  let query = {};
  // If its Amazon store, I dont want to check by the name, since the different
  // variants share the same name, but different urls
  if (queryStore === stores.AMAZON) {
    query = { url: queryUrl };
  } else {
    query = { $or: [{ name: queryName }, { url: queryUrl }] };
  }

  const itemExists = await TrackingModel.findOne(query);

  if (!itemExists) {
    return json({ ok: true, item: undefined });
  }

  return json({ ok: true, item: itemExists });
};
