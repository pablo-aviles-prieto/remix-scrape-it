import type { ProductAvailableMailDynamicData } from '~/interfaces/mail-dynamic-data';
import { renderProductAvailableHtml } from '~/services/mail/email-templates/product-available-html';
import { customEllipsis } from '~/utils/custom-ellipsis';
import { resend } from '~/lib/resend';

type Params = {
  emailReceiver: string;
  dynamicData: ProductAvailableMailDynamicData;
};

export const productAvailableMail = async ({ emailReceiver, dynamicData }: Params) => {
  const result = await resend.sendMail({
    to: emailReceiver,
    subject: `Producto disponible ${customEllipsis(dynamicData.productName)}`,
    html: renderProductAvailableHtml(dynamicData),
  });

  if (result.error) {
    console.error('Error sending product available mail', result.error);
  }
  return result;
};
