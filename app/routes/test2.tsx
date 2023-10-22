import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export function loader() {
  return json({ msg: 'Server sided data' });
}

export default function Test() {
  const data = useLoaderData<typeof loader>();

  console.log('data', data);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Test page</h1>
    </div>
  );
}
