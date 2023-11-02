import { type ActionFunctionArgs, json } from '@remix-run/node';
import TrackingModel from '~/models/tracking';
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
    return json({ response: 'false', error: errorMsgs.invalidPayload }, 400);
  }

  const itemExists = await TrackingModel.findOne({
    $or: [{ name }, { url }],
  });
  console.log('itemExists', itemExists);

  if (!itemExists) {
    const createdTracking = await TrackingModel.create({
      name,
      url,
      image,
      currency,
      prices: [
        {
          date: new Date(),
          price: parseFloat(actualPrice),
        },
      ],
    });
    console.log('createdTracking', createdTracking);
    console.log('createdTracking.id', createdTracking.id);
  }

  return json({ response: 'ok', data: 'Yep' }, 202);
}
