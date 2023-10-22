import { type ActionFunctionArgs, json } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const rawData = await request.text(); // Read the stream into raw text
  const parsedData = JSON.parse(rawData);
  console.log('parsedData', parsedData);
  return json({ response: 'ok', data: 'Yep' }, 202);
}
