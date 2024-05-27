import cron from 'node-cron';
import { updateTrackedPriceAndSendMail } from '../tracking/update-tracked-items.service';
import { schedules } from './schedules';

const jobs: Map<string, cron.ScheduledTask> = new Map();

/*
 * TODO: Create 2 jobs, one at 12 to update price and send the email to the simple subscribers
 * and check if any desiredPrice is met (if yes, send the mail and remove it from the array, updating lastSubscriberUpdate)
 * AND the other job at 00, just update prices and only check for desiredPrice again
 */
const updatePrices = cron.schedule(
  schedules.updatePrices,
  async () => {
    // TODO: Create a helper to check if there is no subscribers and priceSubscribers in the array,
    // also checking the lastSubscriberUpdate to remove (or not) the item from the trackings
    // Taking in mind that it should pass like 7? days from the lastSubscriberUpdate, and only if there
    // is more than 10? items in the tracking of DB
    console.log(
      `JOB :: Coolmod updating tracked items and sending mails started at ${new Date()}`
    );
    await updateTrackedPriceAndSendMail();
    console.log(
      `JOB :: Coolmod updating tracked items and sending mails finished at ${new Date()}`
    );
  },
  { scheduled: false }
);

jobs.set('updatePricesCoolmod', updatePrices);

export default jobs;
