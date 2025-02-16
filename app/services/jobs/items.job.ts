import cron from 'node-cron';
import { updateTrackedPriceAndSendMail } from '../tracking/update-tracked-items.service';
import { schedules } from './schedules';
import { getErrorsAndSendMail } from '../errors/check-errors-and-send-mail.service';

const jobs: Map<string, cron.ScheduledTask> = new Map();

const updatePricesAndSendSubscriberMail = cron.schedule(
  schedules.updatePricesMorning,
  async () => {
    console.log(`JOB :: Updating tracked items and sending mails started at ${new Date()}`);
    await updateTrackedPriceAndSendMail({ sendSubscriberMail: true });
    await getErrorsAndSendMail();
    console.log(`JOB :: Updating tracked items and sending mails finished at ${new Date()}`);
  },
  { scheduled: false }
);

const updatePrices = cron.schedule(
  schedules.updatePricesMidnightAndAfternoon,
  async () => {
    console.log(`JOB :: Updating tracked items started at ${new Date()}`);
    await updateTrackedPriceAndSendMail({ sendSubscriberMail: false });
    await getErrorsAndSendMail();
    console.log(`JOB :: Updating tracked items finished at ${new Date()}`);
  },
  { scheduled: false }
);

jobs.set('updatePricesAndSendSubscriberMail', updatePricesAndSendSubscriberMail);
jobs.set('updatePrices', updatePrices);

export default jobs;
