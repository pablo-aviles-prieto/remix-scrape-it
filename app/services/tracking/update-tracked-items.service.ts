import { getAllTrackedItems } from './get-all-tracked-items.service';

export const updateTrackedItems = async () => {
  const trackedItems = await getAllTrackedItems();
  const pricesItems = trackedItems.map((item) => item.prices);
  console.log('pricesItems', pricesItems);
  return pricesItems;
};
