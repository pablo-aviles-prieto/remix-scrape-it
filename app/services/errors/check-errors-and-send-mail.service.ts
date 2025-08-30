import ErrorModel from '~/models/errors';
import { scrappingErrorsMail } from '../mail/scrapping-errors-mail.service';

interface ErrorParams {
  numberOfErrors: number;
  arrayOfErrorsID: string[];
}

export const getErrorsAndSendMail = async () => {
  try {
    // Find all errors with notifiedByEmail set to false
    const errors = await ErrorModel.find({ notifiedByEmail: false }).exec();

    if (errors.length === 0) return;

    // Extract the necessary information
    const numberOfErrors = errors.length;
    const arrayOfErrorsID = errors.map(error => error.id.toString());

    // Send the email
    const params: ErrorParams = {
      numberOfErrors,
      arrayOfErrorsID,
    };

    await scrappingErrorsMail(params);

    // Update the errors to set notifiedByEmail to true
    await ErrorModel.updateMany(
      { _id: { $in: arrayOfErrorsID } },
      { $set: { notifiedByEmail: true } }
    );

    console.log(`Notified about ${numberOfErrors} errors and updated their status.`);
  } catch (err) {
    console.error('Error while notifying about errors:', err);
  }
};
