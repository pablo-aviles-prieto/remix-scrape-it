import TrackingModel from '~/models/trackings';
import { getCoolmodSingleItem } from '../scrap/coolmod.service';
import { getAllTrackedItems } from './get-all-tracked-items.service';
import { transformDecimalOperator } from '~/utils/transform-decimal-operator';

export const updateTrackedItems = async () => {
  const trackedItems = await getAllTrackedItems();

  /*
   * Instead of creating a map of promises to resolve them all with a Promise.all
   * I'm executing sequentially each scrap service call to avoid overloading the server
   * running multiples chromiums in parallel
   */

  for (const item of trackedItems) {
    const updatedData = await getCoolmodSingleItem({ productPage: item.url });
    const updatedPrice = updatedData.actualPrice;
    const parsedUpdatedPrice = transformDecimalOperator(updatedPrice ?? '0');

    await TrackingModel.updateOne(
      { _id: item._id },
      {
        $push: {
          prices: {
            price: parseFloat(parsedUpdatedPrice),
            date: new Date(),
          },
        },
      }
    );
  }
};
