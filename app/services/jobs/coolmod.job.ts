import cron from 'node-cron';
import { updateTrackedPriceAndSendMail } from '../tracking/update-tracked-items.service';
import { schedules } from './schedules';

const jobs: Map<string, cron.ScheduledTask> = new Map();

// TODO: The send mail should be only executed at 00, not at 12
const updatePrices = cron.schedule(
  schedules.updatePrices,
  async () => {
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
