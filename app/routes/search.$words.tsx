import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { ListItemsCoolmod } from '~/interfaces/ItemCoolmod';
import { getCoolmodListItems } from '~/services/scrap/coolmod.service';
import { errorMsgs } from '~/utils/const';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: ListItemsCoolmod[];
};

export const loader = async ({ params }: ActionFunctionArgs) => {
  if (!params.words) {
    return json({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
  try {
    const scrapResponse = await getCoolmodListItems({
      querySearch: params.words,
    });

    return json({
      ok: true,
      data: scrapResponse,
    });
  } catch (err) {
    console.log('ERROR LIST ITEMS', err);
    return json({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
};

export default function SearchItem() {
  const { data, ok, error } = useLoaderData<LoaderResponse>();

  if (!data) {
    if (!ok && error) {
      // show error
    }
    return <div>No data for the search</div>;
  }

  return (
    <div>
      <div>Search item - Displaying the list of items searched by keyword</div>
      <div>
        {data.map((item) => {
          return (
            <div key={item.url} className='flex gap-x-2'>
              <p>Name: {item.name}</p>
              <p>ImgPath: {item.imgPath}</p>
              <p>Price: {item.price}</p>
              <p>Url: {item.url}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
