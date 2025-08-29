import { Resend } from 'resend';
import type { ProductAvailableMailDynamicData } from '~/interfaces/mail-dynamic-data';
import { renderProductAvailableHtml } from '~/services/mail/email-templates/product-available-html';
import { customEllipsis } from '~/utils/custom-ellipsis';

const { RESEND_API_KEY, SENDER_MAIL } = process.env;

const resend = new Resend(RESEND_API_KEY);

type Params = {
  emailReceiver: string;
  dynamicData: ProductAvailableMailDynamicData;
};

export const productAvailableMail = async ({ emailReceiver, dynamicData }: Params) => {
  const result = await resend.emails.send({
    from: `ScrapeIt Info <${SENDER_MAIL}>`,
    to: emailReceiver,
    subject: `ScrapeIt! - Producto disponible ${customEllipsis(dynamicData.productName)}`,
    html: renderProductAvailableHtml(dynamicData),
  });

  if (result.error) {
    console.error('Error sending product available mail', result.error);
  }
  return result;
};
