import sgMail from '@sendgrid/mail';
import type { DailyMailDynamicData } from '~/interfaces/mail-dynamic-data';
import { customEllipsis } from '~/utils/custom-ellipsis';

const {
  SENDGRID_API_KEY,
  SENDGRID_DAILY_MAIL_TEMPLATE_ID,
  SENDGRID_SENDER_MAIL,
} = process.env;
sgMail.setApiKey(SENDGRID_API_KEY ?? '');

type Params = {
  emailReceiver: string;
  dynamicData: DailyMailDynamicData;
};

export const dailyMailSender = ({ emailReceiver, dynamicData }: Params) => {
  const emailData: sgMail.MailDataRequired = {
    to: emailReceiver,
    from: SENDGRID_SENDER_MAIL ?? '',
    subject: `ScrapeIt! - Seguimiento ${customEllipsis(
      dynamicData.productName
    )}`,
    templateId: SENDGRID_DAILY_MAIL_TEMPLATE_ID ?? '',
    dynamicTemplateData: dynamicData,
  };
  return sgMail.send(emailData);
};
