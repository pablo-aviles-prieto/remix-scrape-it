import type { ActionFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Position, Tooltip } from 'evergreen-ui';
import { Suspense } from 'react';
import type { ListItemsCoolmod } from '~/interfaces/ItemCoolmod';
import { getCoolmodListItems } from '~/services/scrap/coolmod.service';
import { errorMsgs } from '~/utils/const';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: Promise<ListItemsCoolmod[]>;
};

export const loader = async ({ params }: ActionFunctionArgs) => {
  if (!params.words) {
    return defer({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
  try {
    const scrapResponsePromise = getCoolmodListItems({
      querySearch: params.words,
    });

    return defer({
      ok: true,
      data: scrapResponsePromise,
    });
  } catch (err) {
    console.log('ERROR LIST ITEMS', err);
    return defer({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
};

export default function SearchItem() {
  const { data, ok, error } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div>Search item - Displaying the list of items searched by keyword</div>
      <div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12'>
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={data as Promise<ListItemsCoolmod[]>}>
              {(resolvedData) =>
                resolvedData.map((item) => (
                  <div
                    key={item.url}
                    className='w-full relative shadow-md rounded-lg overflow-hidden'
                  >
                    <img
                      src={
                        item.imgPath ??
                        'https://static.vecteezy.com/system/resources/previews/007/126/739/non_2x/question-mark-icon-free-vector.jpg'
                      }
                      alt={item.name}
                      className='w-full h-auto object-cover rounded-lg cursor-pointer'
                    />
                    <div
                      className='absolute bottom-0 left-0 right-0 h-30 bg-slate-900 bg-opacity-70 
                      backdrop-blur-[3px] text-white p-2 rounded-b-lg'
                    >
                      <Tooltip content={item.name} position={Position.TOP}>
                        <h1 className='text-sm font-semibold overflow-hidden line-clamp-1'>
                          {item.name}
                        </h1>
                      </Tooltip>
                      <div className='pt-1 flex items-center justify-between'>
                        <p className='text-xl'>{item.price}</p>
                        <a
                          href={item.url ?? ''}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='underline'
                        >
                          Visitar página
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              }
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
