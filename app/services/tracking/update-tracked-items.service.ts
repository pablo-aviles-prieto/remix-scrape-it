import TrackingModel from '~/models/trackings';
import { getCoolmodSingleItem } from '../scrap/coolmod.service';
import { getAllTrackedItems } from './get-all-tracked-items.service';
import { mailSender } from '../mail/mail-sender.service';
import type { ClientResponse } from '@sendgrid/mail';
import { format } from 'date-fns';
import { dateFormat } from '~/utils/const';
import type { MailDynamicData } from '~/interfaces/mail-dynamic-data';
import CryptoJS from 'crypto-js';

type UpdateItemSubscriber = {
  email: string;
  id: string;
};

type UpdateDesiredPriceSubscriber = {
  id: string;
  email: string;
  desiredPrice: string;
};

const { APP_BASE_URL, SECRET_UNSUBSCRIBE } = process.env;

// TODO: Add an if condition to check if the price met any desiredPrice (if exist for that item)
// and send the email to that user. In this case, remove that object from the desiredPriceSubscribers
// also updating the lastSubscriberUpdate date
// TODO: To do this, im gonna have to create a new template for the emails, or change the content
// that is being passed
// TODO: Gonna have to allow the unsubscribe for the desiredPriceSubscribers in concrete

// TODO: Create a helper to check if there is no subscribers and priceSubscribers in the array,
// also checking the lastSubscriberUpdate to remove (or not) the item from the trackings
// Taking in mind that it should pass like 7? days from the lastSubscriberUpdate, and only if there
// is more than 10? items in the tracking of DB
export const updateTrackedPriceAndSendMail = async ({
  sendSubscriberMail = false,
}: {
  sendSubscriberMail?: boolean;
}) => {
  const trackedItems = await getAllTrackedItems();

  /*
   * Instead of creating a map of promises to resolve them all with a Promise.all
   * I'm executing sequentially each scrap service call to avoid overloading the server
   * running multiples chromiums in parallel!
   */

  const allEmailPromises: Promise<[ClientResponse, {}]>[] = [];

  for (const item of trackedItems) {
    let updatedPrice: string | undefined;

    try {
      const updatedData = await getCoolmodSingleItem({ productPage: item.url });
      updatedPrice = updatedData?.actualPrice;
      if (!updatedPrice) {
        console.log(`No updated price found for item ${item.name}, skipping.`);
        continue;
      }

      await TrackingModel.updateOne(
        { _id: item._id },
        {
          $push: {
            prices: {
              price: updatedPrice ?? '0',
              date: new Date(),
            },
          },
        }
      );
    } catch (err) {
      console.log('ERROR UPDATING PRICES ON CRON JOB', err);
    }

    if (sendSubscriberMail && item.subscribers && item.subscribers.length > 0) {
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
          price: p.price,
        })),
      ];

      const emailPromises = item.subscribers.map((email: string) => {
        const encodedMail = CryptoJS.AES.encrypt(
          email,
          SECRET_UNSUBSCRIBE ?? ''
        ).toString();

        const dynamicData: MailDynamicData = {
          productName: item.name,
          productImage: item.image,
          productUrl: `${APP_BASE_URL}/item/${item.id}`,
          unsubscribeUrl: `${APP_BASE_URL}/item/${item.id}/unsubscribe?id=${encodedMail}`,
          prices: pricesData,
        };

        return mailSender({ emailReceiver: email, dynamicData });
      });

      allEmailPromises.push(...emailPromises);
    }
    // TODO: Check the desiredPriceSubscribers array and if updatedPrice is equal or less the subscribed desired prices
    // send the email, and delete it from the array.
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
      $set: {
        lastSubscriberUpdate: new Date(),
      },
    }
  );
};

export const updateTrackedItemDesiredPriceSubscribers = async ({
  email,
  id,
  desiredPrice,
}: UpdateDesiredPriceSubscriber) => {
  return TrackingModel.updateOne(
    { _id: id },
    {
      $addToSet: {
        desiredPriceSubscribers: { email, desiredPrice },
      },
      $set: {
        lastSubscriberUpdate: new Date(),
      },
    }
  );
};
