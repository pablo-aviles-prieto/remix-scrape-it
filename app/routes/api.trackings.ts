import { type ActionFunctionArgs, json } from '@remix-run/node';
import TrackingModel from '~/models/trackings';
import { errorMsgs } from '~/utils/const';

type Payload = {
  name: string;
  url: string;
  image: string;
  currency: string;
  actualPrice: string;
};

export async function action({ request }: ActionFunctionArgs) {
  const rawData = await request.text();
  const { name, url, image, currency, actualPrice } = JSON.parse(
    rawData
  ) as Payload;

  if (!name || !url || !image || !currency || !actualPrice) {
    return json({ ok: false, error: errorMsgs.invalidPayload }, 400);
  }

  const itemExists = await TrackingModel.findOne({
    $or: [{ name }, { url }],
  });

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

  if (!queryUrl || !queryName) {
    return json(
      {
        ok: false,
        error: errorMsgs.invalidParams,
      },
      400
    );
  }

  const itemExists = await TrackingModel.findOne({
    $or: [{ name: queryName }, { url: queryUrl }],
  });

  if (!itemExists) {
    return json({ ok: true, item: undefined });
  }

  return json({ ok: true, item: itemExists });
};
