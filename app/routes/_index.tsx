import type { MetaFunction } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li onClick={() => navigate('/test')}>Go to test</li>
        <li onClick={() => navigate('/test2')}>Go to test2</li>
      </ul>
    </div>
  );
}
