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
import { ALIEXPRESS_REGEX, COOLMOD_REGEX, stores } from './utils/const';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: tailwindStylesheet },
  { rel: 'stylesheet', href: globalStylesheet },
  { rel: 'stylesheet', href: slickStylesheet },
  { rel: 'stylesheet', href: slickThemeStylesheet },
  { rel: 'stylesheet', href: reactLoadingSkeleton },
];

// TODO: Change the metadata for aliexpress and coolmod.
// add metadata on different pages for SEO
export const meta: MetaFunction = () => {
  return [
    { title: 'ScrapeIt! - Seguimiento de precios de Coolmod' },
    {
      name: 'description',
      content:
        'ScrapeIt! te permite rastrear y seguir los precios de los productos de Coolmod. Crea seguimientos para tus productos favoritos y recibe actualizaciones diarias por correo electrónico sobre los últimos precios.',
    },
  ];
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
    const inferredStore = isAliexpressUrl ? stores.ALIEXPRESS : stores.COOLMOD;
    return searchWord.startsWith('https://')
      ? redirect(`/search/details?store=${inferredStore}&url=${searchWord}`)
      : redirect(
          `/search/details?store=${inferredStore}&url=https://${searchWord}`
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
