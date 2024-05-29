import sgMail from '@sendgrid/mail';
import type { ProductAvailableMailDynamicData } from '~/interfaces/mail-dynamic-data';

const {
  SENDGRID_API_KEY,
  SENDGRID_PRODUCT_AVAILABLE_TEMPLATE_ID,
  SENDGRID_SENDER_MAIL,
} = process.env;
sgMail.setApiKey(SENDGRID_API_KEY ?? '');

type Params = {
  emailReceiver: string;
  dynamicData: ProductAvailableMailDynamicData;
};

export const productAvailableMail = ({
  emailReceiver,
  dynamicData,
}: Params) => {
  const emailData: sgMail.MailDataRequired = {
    to: emailReceiver,
    from: SENDGRID_SENDER_MAIL ?? '',
    subject: `ScrapeIt! - Producto disponible ${dynamicData.productName
      .substring(0, 10)
      .trim()}...`,
    templateId: SENDGRID_PRODUCT_AVAILABLE_TEMPLATE_ID ?? '',
    dynamicTemplateData: dynamicData,
  };
  return sgMail.send(emailData);
};
