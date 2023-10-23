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
import { SearchContainer } from './components/search-container/search-container';
import { AppLayout } from './components/styles/app-layout';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: tailwindStylesheet },
];

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const searchWord = formData.get('search');
  console.log('searchWord', searchWord);
  return redirect(`/search`);
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
          <>
            <section>
              <SearchContainer />
            </section>
            <section className='mt-8'>
              <Outlet />
            </section>
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </>
        </AppLayout>
      </body>
    </html>
  );
}
