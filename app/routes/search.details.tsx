import type { ActionFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { LoaderWrapper } from '~/components/loader/loader-wrapper';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import { ItemCard } from '~/components/cards/item-card';
import type { SingleItemCoolmod } from '~/interfaces/item-coolmod';
import { getCoolmodSingleItem } from '~/services/scrap/coolmod.service';
import { errorMsgs, stores } from '~/utils/const';
import { getAliexpressSingleItem } from '~/services/scrap/aliexpress.service';
import { ErrorRetrieveData } from '~/components/error/error-retrieve-data';

type LoaderResponse = {
  ok: boolean;
  error?: string;
  data?: Promise<SingleItemCoolmod | null>;
  url: URL;
};

const ERROR_MESSAGE =
  'No se pudo obtener los datos del producto, revise el enlace proporcionado e inténtelo más tarde.';

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryUrl = url.searchParams.get('url');
  const queryStore = url.searchParams.get('store');
  if (!queryUrl || !queryUrl.startsWith('https://')) {
    return defer({
      ok: false,
      error: 'Revise la URL introducida',
      url: queryUrl,
    });
  }

  try {
    let scrapResponsePromise: Promise<SingleItemCoolmod | null> =
      Promise.resolve(null);

    if (queryStore === stores.COOLMOD) {
      scrapResponsePromise = getCoolmodSingleItem({
        productPage: queryUrl,
      });
    } else {
      const aliexpressScrap = getAliexpressSingleItem({
        productPage: queryUrl,
      });
      console.log('aliexpressScrap', aliexpressScrap);
    }

    return defer({
      ok: true,
      data: scrapResponsePromise,
      url: queryUrl,
    });
  } catch (err) {
    console.log('ERROR SINGLE ITEM', err);
    return defer({
      ok: false,
      error: errorMsgs.internalError,
      url: queryUrl,
    });
  }
};

export default function SearchIndex() {
  const { data, ok, error, url } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return <ErrorRetrieveData>{ERROR_MESSAGE}</ErrorRetrieveData>;
  }

  return (
    <div>
      <LoaderWrapper>
        <Suspense fallback={<FallbackLoader />}>
          <Await resolve={data as Promise<SingleItemCoolmod | null>}>
            {(resolvedData) => {
              if (!resolvedData) {
                return <ErrorRetrieveData>{ERROR_MESSAGE}</ErrorRetrieveData>;
              }
              return (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.5 }}
                >
                  <ItemCard item={resolvedData} urlItem={url} />
                </motion.div>
              );
            }}
          </Await>
        </Suspense>
      </LoaderWrapper>
    </div>
  );
}
