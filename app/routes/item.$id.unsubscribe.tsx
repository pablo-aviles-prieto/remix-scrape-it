import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { errorMsgs } from '~/utils/const';
import CryptoJS from 'crypto-js';
import { Dialog } from 'evergreen-ui';
import { useState } from 'react';
import { UnsubscribeModal } from '~/components/modal/unsubscribe-modal';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { removeSubscriber } from '~/services/tracking/remove-subscriber.service';

type LoaderResponse = {
  ok: boolean;
  id: string;
  mail?: string;
  error?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('unsubscribe-email')?.toString()?.trim();
  const itemId = formData.get('item-id')?.toString();
  console.log('email', email);
  console.log('itemId', itemId);

  const response = await removeSubscriber({
    emailToRemove: email ?? '',
    trackingId: itemId ?? '',
  });
  console.log('response', response);

  return json(response);
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { SECRET_UNSUBSCRIBE } = process.env;
  const url = new URL(request.url);
  const queryId = url.searchParams.get('id');

  if (!queryId) {
    return redirect(`/`);
  }

  try {
    // searchParams removes the + by a blank space
    const parsedQueryId = queryId.replaceAll(' ', '+');
    const bytes = CryptoJS.AES.decrypt(parsedQueryId, SECRET_UNSUBSCRIBE ?? '');
    const decryptedMail = bytes.toString(CryptoJS.enc.Utf8);
    console.log('decryptedMail', decryptedMail);

    return json({
      ok: true,
      mail: decryptedMail,
      id: queryId,
    });
  } catch (err) {
    console.log('ERROR DECRYPTING', err);
    return json({
      ok: false,
      error: errorMsgs.genericError,
      id: queryId,
    });
  }
};

export default function Unsubscribe() {
  const { ok, id, error, mail } = useLoaderData<LoaderResponse>();
  const itemData = useOutletContext<TrackingResponse>();
  const [hasIdAndMail, setHasIdAndMail] = useState(Boolean(id && mail));

  if (!ok && error) {
    // TODO: Show a toast and not return anything at all
    return null;
  }

  if (!hasIdAndMail) {
    // Show a toast since mail wasnt retrieved, meaning that the id provided is incorrect
  }

  return (
    <Dialog
      isShown={hasIdAndMail}
      onCloseComplete={() => setHasIdAndMail(false)}
      hasHeader={false}
      hasFooter={false}
    >
      <UnsubscribeModal
        mail={mail ?? ''}
        itemId={itemData.id}
        itemName={itemData.name}
        onClose={() => setHasIdAndMail(false)}
      />
    </Dialog>
  );
}
