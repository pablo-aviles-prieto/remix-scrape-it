import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { errorMsgs } from '~/utils/const';
import CryptoJS from 'crypto-js';
import { Dialog } from 'evergreen-ui';
import { useEffect, useState } from 'react';
import { UnsubscribeModal } from '~/components/modal/unsubscribe-modal';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { removeSubscriber } from '~/services/tracking/remove-subscriber.service';
import toast from 'react-hot-toast';
import { useModifyDocumentTitle } from '~/hooks/use-modify-metadata-title';
import { customEllipsis } from '~/utils/custom-ellipsis';

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

  const response = await removeSubscriber({
    emailToRemove: email ?? '',
    trackingId: itemId ?? '',
  });

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
  const [isShown, setIsShown] = useState(Boolean(id && mail));
  const { modifyDocTitle } = useModifyDocumentTitle();

  useEffect(() => {
    modifyDocTitle(
      `Desubscribirse del producto ${customEllipsis(itemData.name, 15)} de ${
        itemData.store
      }`
    );
  }, [modifyDocTitle, itemData]);

  if (!ok && error) {
    toast.error(`Error interno. Inténtelo más tarde`);
    return null;
  }

  if (!id || !mail) {
    toast.error(`Revise la URL proporcionada o contacte con el administrador`);
    return;
  }

  return (
    <Dialog
      isShown={isShown}
      onCloseComplete={() => setIsShown(false)}
      hasHeader={false}
      hasFooter={false}
    >
      <UnsubscribeModal
        mail={mail ?? ''}
        itemId={itemData.id}
        itemName={itemData.name}
        onClose={() => setIsShown(false)}
      />
    </Dialog>
  );
}
