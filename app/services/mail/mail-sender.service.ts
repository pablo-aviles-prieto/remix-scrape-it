import sgMail from '@sendgrid/mail';
import type { MailDynamicData } from '~/interfaces/mail-dynamic-data';

const { SENDGRID_API_KEY, SENDGRID_DYNAMIC_ID, SENDGRID_SENDER_MAIL } =
  process.env;
sgMail.setApiKey(SENDGRID_API_KEY ?? '');

type Params = {
  emailReceiver: string;
  dynamicData: MailDynamicData;
};

export const mailSender = ({ emailReceiver, dynamicData }: Params) => {
  const emailData: sgMail.MailDataRequired = {
    to: emailReceiver,
    from: SENDGRID_SENDER_MAIL ?? '',
    subject: `ScrapeIt! - Seguimiento ${dynamicData.productName
      .substring(0, 10)
      .trim()}...`,
    templateId: SENDGRID_DYNAMIC_ID ?? '',
    dynamicTemplateData: dynamicData,
  };
  return sgMail.send(emailData);
};
