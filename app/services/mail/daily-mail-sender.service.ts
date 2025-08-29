import { Resend } from 'resend';
import type { DailyMailDynamicData } from '~/interfaces/mail-dynamic-data';
import { renderDailyMailHtml } from '~/services/mail/email-templates/daily-mail-html';
import { customEllipsis } from '~/utils/custom-ellipsis';

const { RESEND_API_KEY, SENDER_MAIL } = process.env;

const resend = new Resend(RESEND_API_KEY);

type Params = {
  emailReceiver: string;
  dynamicData: DailyMailDynamicData;
};

export const dailyMailSender = async ({ emailReceiver, dynamicData }: Params) => {
  const result = await resend.emails.send({
    from: `ScrapeIt Info <${SENDER_MAIL}>`,
    to: emailReceiver,
    subject: `ScrapeIt! - Seguimiento ${customEllipsis(dynamicData.productName)}`,
    html: renderDailyMailHtml(dynamicData),
  });

  if (result.error) {
    return console.error({ error: result.error });
  }

  console.log({ data: result.data });

  return result;
};
