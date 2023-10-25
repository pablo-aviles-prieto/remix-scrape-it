import { type ActionFunctionArgs, json } from '@remix-run/node';
import { scrapCoolmod } from '~/services/scrap/coolmod.service';

export const loader = async ({ params, request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const queryUrl = url.searchParams.get('url');
  console.log('queryUrl', queryUrl);
  console.log('params', params);

  await scrapCoolmod();

  return json({ url: params.url });
};
