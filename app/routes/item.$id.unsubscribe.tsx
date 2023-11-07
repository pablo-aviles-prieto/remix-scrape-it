import type { ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { errorMsgs } from '~/utils/const';
import CryptoJS from 'crypto-js';

type LoaderResponse = {
  ok: boolean;
  id: string;
  mail?: string;
  error?: string;
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { SECRET_UNSUBSCRIBE } = process.env;
  const url = new URL(request.url);
  const queryId = url.searchParams.get('id');

  if (!queryId) {
    return redirect(`/`);
  }

  try {
    const bytes = CryptoJS.AES.decrypt(queryId, SECRET_UNSUBSCRIBE ?? '');
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
  console.log('mail unsubscribe', mail);
  if (!ok && error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      ID: {id} // Mail: {mail}
    </div>
  );
}
