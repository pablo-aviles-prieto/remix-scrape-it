// import sgMail from '@sendgrid/mail';
// import type { DailyMailDynamicData } from '~/interfaces/mail-dynamic-data';
// import { customEllipsis } from '~/utils/custom-ellipsis';

// const {
//   SENDGRID_API_KEY,
//   SENDGRID_DAILY_MAIL_TEMPLATE_ID,
//   SENDGRID_SENDER_MAIL,
// } = process.env;
// sgMail.setApiKey(SENDGRID_API_KEY ?? '');

// type Params = {
//   emailReceiver: string;
//   dynamicData: DailyMailDynamicData;
// };

// export const dailyMailSender = ({ emailReceiver, dynamicData }: Params) => {
//   const emailData: sgMail.MailDataRequired = {
//     to: emailReceiver,
//     from: SENDGRID_SENDER_MAIL ?? '',
//     subject: `ScrapeIt! - Seguimiento ${customEllipsis(
//       dynamicData.productName
//     )}`,
//     templateId: SENDGRID_DAILY_MAIL_TEMPLATE_ID ?? '',
//     dynamicTemplateData: dynamicData,
//   };
//   return sgMail.send(emailData);
// };

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
    from: SENDER_MAIL ?? '',
    to: [emailReceiver],
    subject: `ScrapeIt! - Seguimiento ${customEllipsis(dynamicData.productName)}`,
    html: renderDailyMailHtml(dynamicData),
  });

  if (result.error) {
    return console.error({ error: result.error });
  }

  console.log({ data: result.data });

  return result;
};
