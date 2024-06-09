import cron from 'node-cron';
import { updateTrackedPriceAndSendMail } from '../tracking/update-tracked-items.service';
import { schedules } from './schedules';

const jobs: Map<string, cron.ScheduledTask> = new Map();

// TODO: Change the name to a generic one instead of Coolmod
const updatePricesAndSendSubscriberMail = cron.schedule(
  schedules.updatePricesMidnight,
  async () => {
    console.log(
      `JOB :: Coolmod updating tracked items and sending mails started at ${new Date()}`
    );
    await updateTrackedPriceAndSendMail({ sendSubscriberMail: true });
    console.log(
      `JOB :: Coolmod updating tracked items and sending mails finished at ${new Date()}`
    );
  },
  { scheduled: false }
);

const updatePrices = cron.schedule(
  schedules.updatePricesNoon,
  async () => {
    console.log(
      `JOB :: Coolmod updating tracked items started at ${new Date()}`
    );
    await updateTrackedPriceAndSendMail({ sendSubscriberMail: false });
    console.log(
      `JOB :: Coolmod updating tracked items finished at ${new Date()}`
    );
  },
  { scheduled: false }
);

jobs.set(
  'updatePricesAndSendSubscriberMailCoolmod',
  updatePricesAndSendSubscriberMail
);
jobs.set('updatePricesCoolmod', updatePrices);

export default jobs;
