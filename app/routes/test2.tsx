import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';

export function loader() {
  return json({ msg: 'Server sided data' });
}

export default function Test() {
  const navigate = useNavigate();
  const data = useLoaderData<typeof loader>();

  const sendDummyData = async () => {
    const response = await fetch('/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: 'hello' }),
    });
    const parsedRes = await response.json();
    console.log('parsedRes', parsedRes);
  };

  console.log('data', data);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Test2 page, getting server side data on console log</h1>
      <button type='button' onClick={() => navigate('/')}>
        Go to homepage
      </button>
      <button type='button' onClick={sendDummyData}>
        Send request to /data
      </button>
    </div>
  );
}
