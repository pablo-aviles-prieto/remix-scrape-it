import { resend } from '~/lib/resend';

const { SENDER_MAIL, ADMIN_EMAIL, URL_TO_SCRAPEIT_ERROR_COLLECTION } = process.env;

interface Params {
  numberOfErrors: number;
  arrayOfErrorsID: string[];
}

// TODO: Change the url URL_TO_SCRAPEIT_ERROR_COLLECTION, so we send to the mail a concrete url
// with the created error documents filtered, to only display the newly created documents
export const scrappingErrorsMail = async ({ numberOfErrors, arrayOfErrorsID }: Params) => {
  const result = await resend.sendMail({
    from: `ScrapeIt ERRORS <${SENDER_MAIL}>`,
    to: ADMIN_EMAIL ?? '',
    subject: `${numberOfErrors} errores generados`,
    html: `<h1>New errors generated (${numberOfErrors})</h1>
           <p>(${arrayOfErrorsID.join(
             ', '
           )}) generated recently. Check the <a href="${URL_TO_SCRAPEIT_ERROR_COLLECTION}">Database</a></p>
          `,
  });

  if (result.error) {
    console.error('Error sending scrapping errors mail', result.error);
  }

  return result;
};
