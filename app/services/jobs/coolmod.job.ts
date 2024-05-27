import cron from 'node-cron';
import { updateTrackedPriceAndSendMail } from '../tracking/update-tracked-items.service';
import { schedules } from './schedules';

const jobs: Map<string, cron.ScheduledTask> = new Map();

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
  schedules.updatePricesMidnight,
  async () => {
    console.log(`JOB :: Coolmod updating tracked items ${new Date()}`);
    await updateTrackedPriceAndSendMail({ sendSubscriberMail: false });
    console.log(`JOB :: Coolmod updating tracked items ${new Date()}`);
  },
  { scheduled: false }
);

jobs.set(
  'updatePricesAndSendSubscriberMailCoolmod',
  updatePricesAndSendSubscriberMail
);
jobs.set('updatePricesCoolmod', updatePrices);

export default jobs;
