import TrackingModel from '~/models/trackings';
import { getCoolmodSingleItem } from '../scrap/coolmod.service';
import { getAllTrackedItems } from './get-all-tracked-items.service';
import { dailyMailSender } from '../mail/daily-mail-sender.service';
import type { ClientResponse } from '@sendgrid/mail';
import { format } from 'date-fns';
import { dateFormat, stores } from '~/utils/const';
import type {
  DailyMailDynamicData,
  ProductAvailableMailDynamicData,
} from '~/interfaces/mail-dynamic-data';
import CryptoJS from 'crypto-js';
import { parseAmount } from '~/utils/parse-amount';
import { productAvailableMail } from '../mail/product-available-mail.service';
import { cleanUnusedTrackedItems } from './clean-unused-tracked-items.service';
import { getAliexpressSingleItem } from '../scrap/aliexpress.service';
import { getThomannSingleItem } from '../scrap/thomann.service';
import type { IError } from '~/interfaces/error-schema';
import { createErrorDocument } from '../errors/create-error-document.service';
import { getProzisSingleItem } from '../scrap/prozis.service';
import { getAmazonSingleItem } from '../scrap/amazon.service';

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

const STORES_MAPPER = {
  [stores.ALIEXPRESS]: getAliexpressSingleItem,
  [stores.COOLMOD]: getCoolmodSingleItem,
  [stores.THOMANN]: getThomannSingleItem,
  [stores.PROZIS]: getProzisSingleItem,
  [stores.AMAZON]: getAmazonSingleItem,
};

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
      // Retrieving the service to use from the different stores
      const getItemService = STORES_MAPPER[item.store];
      const updatedData = await getItemService({ productPage: item.url });

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
              price: updatedPrice,
              date: new Date(),
            },
          },
        }
      );
    } catch (err) {
      const errorParams: Partial<IError> = {
        message: `Error updating prices on cron job updateTrackedPriceAndSendMail`,
        store: item.store,
        searchValue: item.url,
        responseMessage:
          err instanceof Error ? err.message : JSON.stringify(err),
      };
      await createErrorDocument(errorParams);
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

        const dynamicData: DailyMailDynamicData = {
          productName: item.name,
          productImage: item.image,
          productUrl: `${APP_BASE_URL}/item/${item.id}`,
          unsubscribeUrl: `${APP_BASE_URL}/item/${item.id}/unsubscribe?id=${encodedMail}`,
          prices: pricesData,
        };

        return dailyMailSender({ emailReceiver: email, dynamicData });
      });

      allEmailPromises.push(...emailPromises);
    }

    if (
      updatedPrice &&
      item.desiredPriceSubscribers &&
      item.desiredPriceSubscribers.length > 0
    ) {
      const metSubscribers = item.desiredPriceSubscribers.filter(
        (subscriber) => {
          return (
            parseAmount(updatedPrice) <= parseAmount(subscriber.desiredPrice)
          );
        }
      );

      const desiredPriceEmailPromises = metSubscribers.map((subscriber) => {
        const dynamicData: ProductAvailableMailDynamicData = {
          productName: item.name,
          productImage: item.image,
          productUrl: item.url,
          productPrice: updatedPrice,
        };
        return productAvailableMail({
          dynamicData,
          emailReceiver: subscriber.email,
        });
      });

      if (metSubscribers.length > 0) {
        await TrackingModel.updateOne(
          { _id: item._id },
          {
            $pull: {
              desiredPriceSubscribers: {
                email: { $in: metSubscribers.map((sub) => sub.email) },
              },
            },
            $set: {
              lastSubscriberUpdate: new Date(),
            },
          }
        );
      }
      // Log the emails sent and removed from desiredPriceSubscribers
      metSubscribers.forEach((sub) => {
        console.log(
          `Email sent to ${sub.email}, at price ${updatedPrice} (desired price: ${sub.desiredPrice}) and removed from the desiredPriceSubscribers`
        );
      });

      allEmailPromises.push(...desiredPriceEmailPromises);
    }
  }

  try {
    await Promise.all(allEmailPromises);
  } catch (err) {
    const errorParams: Partial<IError> = {
      message: 'Error sending mails to subscribers',
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    };
    await createErrorDocument(errorParams);
    console.log('ERROR SENDING MAILS TO SUBSCRIBERS', err);
  }
  try {
    await cleanUnusedTrackedItems({ trackedItems });
  } catch (err) {
    const errorParams: Partial<IError> = {
      message: 'Error cleaning unused tracked items',
      responseMessage: err instanceof Error ? err.message : JSON.stringify(err),
    };
    await createErrorDocument(errorParams);
    console.log('ERROR CLEANING UNUSED TRACKED ITEMS', err);
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
  const trackingItem = await TrackingModel.findOne({
    _id: id,
    'desiredPriceSubscribers.email': email,
  });

  if (trackingItem) {
    // Email exists, update the desiredPrice
    // The $ operator is used to refer to the first array element that matches the query condition
    return TrackingModel.updateOne(
      { _id: id, 'desiredPriceSubscribers.email': email },
      {
        $set: {
          'desiredPriceSubscribers.$.desiredPrice': desiredPrice,
          lastSubscriberUpdate: new Date(),
        },
      }
    );
  } else {
    // Email does not exist, add new entry
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
  }
};
