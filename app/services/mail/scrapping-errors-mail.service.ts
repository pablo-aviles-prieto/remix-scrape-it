import sgMail from '@sendgrid/mail';

const {
  SENDGRID_API_KEY,
  SENDGRID_SENDER_MAIL,
  SENDGRID_ADMIN_EMAIL,
  URL_TO_SCRAPEIT_ERROR_COLLECTION,
} = process.env;
sgMail.setApiKey(SENDGRID_API_KEY ?? '');

interface Params {
  numberOfErrors: number;
  arrayOfErrorsID: string[];
}

// TODO: Change the url URL_TO_SCRAPEIT_ERROR_COLLECTION, so we send to the mail a concrete url
// with the created error documents filtered, to only display the newly created documents
export const scrappingErrorsMail = ({
  numberOfErrors,
  arrayOfErrorsID,
}: Params) => {
  const emailData = {
    to: SENDGRID_ADMIN_EMAIL ?? '',
    from: SENDGRID_SENDER_MAIL ?? '',
    subject: `ScrapeIt: ${numberOfErrors} errors generated`,
    html: `<h1>New errors generated (${numberOfErrors})</h1>
           <p>(${arrayOfErrorsID.join(
             ', '
           )}) generated recently. Check the <a href="${URL_TO_SCRAPEIT_ERROR_COLLECTION}">Database</a></p>
          `,
  };
  return sgMail.send(emailData);
};
