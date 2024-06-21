import { cssBundleHref } from '@remix-run/css-bundle';
import { redirect } from '@remix-run/node';
import type {
  MetaFunction,
  ActionFunctionArgs,
  LinksFunction,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import tailwindStylesheet from '~/styles/tailwind.css';
import globalStylesheet from '~/styles/global.css';
import slickStylesheet from 'slick-carousel/slick/slick.css';
import slickThemeStylesheet from 'slick-carousel/slick/slick-theme.css';
import reactLoadingSkeleton from 'react-loading-skeleton/dist/skeleton.css';
import { SearchContainer } from './components/search-container/search-container';
import { AppLayout } from './components/styles/app-layout';
import { Toaster } from 'react-hot-toast';
import {
  ALIEXPRESS_HOSTNAME,
  ALIEXPRESS_REGEX,
  COOLMOD_REGEX,
  stores,
} from './utils/const';
import { createBaseMetadataInfo } from './utils/create-base-metadata-info';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: tailwindStylesheet },
  { rel: 'stylesheet', href: globalStylesheet },
  { rel: 'stylesheet', href: slickStylesheet },
  { rel: 'stylesheet', href: slickThemeStylesheet },
  { rel: 'stylesheet', href: reactLoadingSkeleton },
];

// TODO: add metadata on different pages for SEO
export const meta: MetaFunction = (ServerRuntimeMetaArgs) => {
  return createBaseMetadataInfo(ServerRuntimeMetaArgs);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const selectedStore = formData.get('selected-store')?.toString();
  const searchWord = formData.get('search')?.toString();

  if (!searchWord) {
    return null;
  }

  // Inferring the store when a URL is provided instead of letting the client decide which store is
  const isAliexpressUrl = ALIEXPRESS_REGEX.test(searchWord);
  const isCoolmodUrl = COOLMOD_REGEX.test(searchWord);

  if (isAliexpressUrl || isCoolmodUrl) {
    const url = new URL(
      searchWord.startsWith('http') ? searchWord : `https://${searchWord}`
    );
    let modifiedUrl = url.href;

    if (isAliexpressUrl) {
      // Convert Aliexpress URL to Spanish version to scrap it like a boss
      url.hostname = ALIEXPRESS_HOSTNAME;
      modifiedUrl = url.href;
    }

    const inferredStore = isAliexpressUrl ? stores.ALIEXPRESS : stores.COOLMOD;
    return redirect(
      `/search/details?store=${inferredStore}&url=${modifiedUrl}`
    );
  } else {
    return redirect(`/search/${searchWord}?store=${selectedStore}`);
  }
};

export default function App() {
  return (
    <html lang='es'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <AppLayout>
          <section>
            <SearchContainer />
          </section>
          <section className='mt-4'>
            <Outlet />
          </section>
          <Toaster position='bottom-right' toastOptions={{ duration: 5000 }} />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </AppLayout>
      </body>
    </html>
  );
}
