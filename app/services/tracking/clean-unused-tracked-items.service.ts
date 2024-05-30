import { isBefore, subDays } from 'date-fns';
import type { IDocTracking } from '~/interfaces/tracking-schema';
import TrackingModel from '~/models/trackings';

const MIN_ITEMS_NEEDED = 10;

interface CleanUnusedTrackedItemsProps {
  trackedItems: IDocTracking[];
}

const isDateOlderThan7Days = (date: Date): boolean => {
  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);
  return isBefore(date, sevenDaysAgo);
};

export const cleanUnusedTrackedItems = async ({
  trackedItems,
}: CleanUnusedTrackedItemsProps) => {
  if (trackedItems.length <= MIN_ITEMS_NEEDED) return;

  // Separate items with and without subscriptions
  const itemsWithSubscriptions = trackedItems.filter(
    (item) =>
      item.subscribers?.length > 0 || item.desiredPriceSubscribers?.length > 0
  );
  const itemsWithoutSubscriptions = trackedItems.filter(
    (item) =>
      (!item.subscribers || item.subscribers.length === 0) &&
      (!item.desiredPriceSubscribers ||
        item.desiredPriceSubscribers.length === 0)
  );

  // Filter out items without subscriptions that are inactive for more than a week
  const inactiveItems = itemsWithoutSubscriptions.filter((item) =>
    isDateOlderThan7Days(item.lastSubscriberUpdate)
  );

  // Combine items with subscriptions and active items without subscriptions
  let remainingItems = [
    ...itemsWithSubscriptions,
    ...itemsWithoutSubscriptions.filter(
      (item) => !isDateOlderThan7Days(item.lastSubscriberUpdate)
    ),
  ];

  // Ensure at least 6 items remain, filling it with the inactiveItems sorted by newest
  if (remainingItems.length < MIN_ITEMS_NEEDED) {
    // Sort the inactive items by creation date (newest first)
    const sortedInactiveItems = inactiveItems.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    // Add the newest inactive items to the remaining items until we have at least 6
    const additionalItemsNeeded = MIN_ITEMS_NEEDED - remainingItems.length;
    remainingItems = [
      ...remainingItems,
      ...sortedInactiveItems.slice(0, additionalItemsNeeded),
    ];
  }

  // Remove the inactive items that should be deleted
  const remainingItemIds = remainingItems.map((item) => item._id.toString());
  const itemsToDelete = inactiveItems.filter(
    (item) => !remainingItemIds.includes(item._id.toString())
  );

  // Log the info of items to be deleted
  itemsToDelete.forEach((item) => {
    console.log(
      `Deleting item: ${item.name}, with url: ${item.url}, where last subscriber was the: ${item.lastSubscriberUpdate}, created on ${item.createdAt}`
    );
  });

  await TrackingModel.deleteMany({
    _id: { $in: itemsToDelete.map((item) => item._id) },
  });
};
