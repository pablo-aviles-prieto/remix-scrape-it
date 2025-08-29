import { Resend } from 'resend';

const { RESEND_API_KEY, SENDER_MAIL, ADMIN_EMAIL, URL_TO_SCRAPEIT_ERROR_COLLECTION } = process.env;

const resend = new Resend(RESEND_API_KEY);

interface Params {
  numberOfErrors: number;
  arrayOfErrorsID: string[];
}

// TODO: Change the url URL_TO_SCRAPEIT_ERROR_COLLECTION, so we send to the mail a concrete url
// with the created error documents filtered, to only display the newly created documents
export const scrappingErrorsMail = async ({ numberOfErrors, arrayOfErrorsID }: Params) => {
  const result = await resend.emails.send({
    from: `ScrapeIt Info <${SENDER_MAIL}>`,
    to: ADMIN_EMAIL ?? '',
    subject: `ScrapeIt! - ${numberOfErrors} errores generados`,
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
