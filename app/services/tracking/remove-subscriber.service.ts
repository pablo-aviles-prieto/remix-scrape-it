import TrackingModel from '~/models/trackings';
import { errorMsgs } from '~/utils/const';

type Params = {
  trackingId: string;
  emailToRemove: string;
};

// TODO: Create another service to remove the user from the desiredPriceSubscribers array
export const removeSubscriber = async ({
  trackingId,
  emailToRemove,
}: Params) => {
  try {
    const doc = await TrackingModel.findById(trackingId);

    if (!doc) {
      return {
        ok: false,
        error: 'No tracking document found with the provided ID',
      };
    }
    if (doc.subscribers.includes(emailToRemove)) {
      doc.subscribers = doc.subscribers.filter(
        (email) => email !== emailToRemove
      );
      doc.lastSubscriberUpdate = new Date();
      await doc.save();
      return {
        ok: true,
        success: `Ya no recibirá más correos de este producto a ${emailToRemove}`,
      };
    } else {
      return {
        ok: true,
        success: `El email ${emailToRemove} ya se encuentra dado de baja`,
      };
    }
  } catch (err) {
    console.log('ERROR REMOVING SUBSCRIBER', err);
    return {
      ok: false,
      error: errorMsgs.internalError,
    };
  }
};
