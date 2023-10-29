import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { SingleItemCoolmod } from '~/interfaces/ItemCoolmod';
import { getCoolmodSingleItem } from '~/services/scrap/coolmod.service';
import { errorMsgs } from '~/utils/const';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: SingleItemCoolmod;
  url: URL;
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryUrl = url.searchParams.get('url');
  if (!queryUrl) {
    return json({
      ok: false,
      error: errorMsgs.internalError,
      url: queryUrl,
    });
  }

  try {
    const scrapResponse = await getCoolmodSingleItem({
      productPage: queryUrl,
    });

    return json({
      ok: true,
      data: scrapResponse,
      url: queryUrl,
    });
  } catch (err) {
    console.log('ERROR SINGLE ITEM', err);
    return json({
      ok: false,
      error: errorMsgs.internalError,
      url: queryUrl,
    });
  }
};

export default function SearchIndex() {
  const { data, ok, error, url } = useLoaderData<LoaderResponse>();

  if (!data) {
    if (!ok && error) {
      // Error
    }
    return <div>No data for the URL provided</div>;
  }

  return (
    <div>
      <div>
        Search details page - Should display the details of an item given a url
        on params
      </div>
      <div key={data.itemName} className='flex gap-x-2'>
        <p>Name: {data.itemName}</p>
        <p>ActualPrice: {data.actualPrice}</p>
        <p>OldPrice: {data.oldPrice}</p>
        <p>Url: {url}</p>
      </div>
    </div>
  );
}
