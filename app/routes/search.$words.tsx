import type { ActionFunctionArgs } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { Await, useLoaderData, useNavigate } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Heading } from 'evergreen-ui';
import { Suspense } from 'react';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import { Info } from '~/components/styles/icons/info';
import { ListItemsCard } from '~/components/cards/list-items-card';
import type { ListItemsCoolmod } from '~/interfaces/item-coolmod';
import { getCoolmodListItems } from '~/services/scrap/coolmod.service';
import { errorMsgs } from '~/utils/const';
import toast from 'react-hot-toast';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: Promise<ListItemsCoolmod[] | null>;
};

export const loader = async ({ params }: ActionFunctionArgs) => {
  if (!params.words) {
    return json({
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
    return json({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
};

export default function SearchItem() {
  const navigate = useNavigate();
  const { data, ok, error } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return (
      <p className='text-center mt-4 text-lg'>
        Error al obtener los productos. Inténtelo más tarde!
      </p>
    );
  }

  return (
    <div className='pb-6'>
      <div className='flex gap-1 my-4 items-center justify-center'>
        <Info
          width={20}
          height={20}
          strokeWidth={2}
          className='text-slate-200'
        />
        <Heading color='muted' size={500}>
          Haz click sobre la imagen de un producto para ver su seguimiento
        </Heading>
      </div>
      <div>
        <LoaderWrapper>
          <Suspense fallback={<FallbackLoader />}>
            <Await resolve={data as Promise<ListItemsCoolmod[] | null>}>
              {(resolvedData) => {
                if (!resolvedData) {
                  toast.error(
                    `No se pudo obtener los datos de los productos, revise los datos introducidos.`,
                    { id: 'list-not-found' }
                  );
                  navigate('/');
                  return;
                }
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 200 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -200 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12'>
                      {resolvedData.map((item) => (
                        <ListItemsCard key={item.url} item={item} />
                      ))}
                    </div>
                  </motion.div>
                );
              }}
            </Await>
          </Suspense>
        </LoaderWrapper>
      </div>
    </div>
  );
}
