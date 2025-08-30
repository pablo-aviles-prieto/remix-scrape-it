import type { DailyMailDynamicData } from '~/interfaces/mail-dynamic-data';
import { resend } from '~/lib/resend';
import { renderDailyMailHtml } from '~/services/mail/email-templates/daily-mail-html';
import { customEllipsis } from '~/utils/custom-ellipsis';

type Params = {
  emailReceiver: string;
  dynamicData: DailyMailDynamicData;
};

export const dailyMailSender = async ({ emailReceiver, dynamicData }: Params) => {
  const result = await resend.sendMail({
    to: emailReceiver,
    subject: `Seguimiento ${customEllipsis(dynamicData.productName)}`,
    html: renderDailyMailHtml(dynamicData),
  });

  if (result.error) {
    console.error('Error sending daily mail', result.error);
  }

  return result;
};
