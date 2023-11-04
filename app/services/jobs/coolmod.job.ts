import cron from 'node-cron';
import { updateTrackedItems } from '../tracking/update-tracked-items.service';
import { schedules } from './schedules';

const jobs: Map<string, cron.ScheduledTask> = new Map();

// TODO: Send the email for the subscribed users to each item!
const updatePrices = cron.schedule(
  schedules.updatePrices,
  async () => {
    console.log(
      `JOB :: Coolmod updating tracked items started at ${new Date()}`
    );
    await updateTrackedItems();
    console.log(
      `JOB :: Coolmod updating tracked items finished at ${new Date()}`
    );
  },
  { scheduled: false }
);

jobs.set('updatePricesCoolmod', updatePrices);

export default jobs;
