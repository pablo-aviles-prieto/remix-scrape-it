import TrackingModel from '~/models/trackings';
import { getCoolmodSingleItem } from '../scrap/coolmod.service';
import { getAllTrackedItems } from './get-all-tracked-items.service';
import { mailSender } from '../mail/mail-sender.service';
import type { ClientResponse } from '@sendgrid/mail';
import { format } from 'date-fns';
import { dateFormat } from '~/utils/const';
import type { MailDynamicData } from '~/interfaces/mail-dynamic-data';

type UpdateItemSubscriber = {
  email: string;
  id: string;
};

const { APP_BASE_URL } = process.env;

export const updateTrackedPriceAndSendMail = async () => {
  const trackedItems = await getAllTrackedItems();

  /*
   * Instead of creating a map of promises to resolve them all with a Promise.all
   * I'm executing sequentially each scrap service call to avoid overloading the server
   * running multiples chromiums in parallel
   */

  const allEmailPromises: Promise<[ClientResponse, {}]>[] = [];

  for (const item of trackedItems) {
    const updatedData = await getCoolmodSingleItem({ productPage: item.url });
    const updatedPrice = updatedData.actualPrice; // Returned in JS number (2399.95 instead of 2.399,95)

    try {
      await TrackingModel.updateOne(
        { _id: item._id },
        {
          $push: {
            prices: {
              price: parseFloat(updatedPrice ?? '0'),
              date: new Date(),
            },
          },
        }
      );
    } catch (err) {
      console.log('ERROR UPDATING PRICES ON CRON JOB', err);
    }

    if (item.subscribers && item.subscribers.length) {
      const sortedPrices = [...item.prices].sort((a, b) =>
        b.date.toISOString().localeCompare(a.date.toISOString())
      );
      const pricesData = [
        {
          date: format(new Date(), dateFormat.euWithTime),
          price: updatedPrice ?? '',
        },
        ...sortedPrices.slice(0, 4).map((p) => ({
          date: format(p.date, dateFormat.euWithTime),
          price: String(p.price),
        })),
      ];

      const emailPromises = item.subscribers.map((email: string) => {
        const dynamicData: MailDynamicData = {
          // TODO: Create a unsubscribeUrl with cryptojs
          productName: item.name,
          productImage: item.image,
          productUrl: `${APP_BASE_URL}/item/${item.id}`,
          unsubscribeUrl: `${APP_BASE_URL}/item/${item.id}/unsubscribe?id=TOKEN`,
          prices: pricesData,
        };

        return mailSender({ emailReceiver: email, dynamicData });
      });

      allEmailPromises.push(...emailPromises);
    }
  }
  try {
    await Promise.all(allEmailPromises);
  } catch (err) {
    console.log('ERROR SENDING MAILS TO SUBSCRIBERS', err);
  }
};

export const updateTrackedItemSubscribers = async ({
  email,
  id,
}: UpdateItemSubscriber) => {
  return TrackingModel.updateOne(
    { _id: id },
    {
      $addToSet: {
        subscribers: email,
      },
    }
  );
};
