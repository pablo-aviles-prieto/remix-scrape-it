import { useNavigate } from '@remix-run/react';

export default function Test() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Test page, gets redirected on /api/data route</h1>
      <button type='button' onClick={() => navigate('/')}>
        Go to homepage
      </button>
    </div>
  );
}
