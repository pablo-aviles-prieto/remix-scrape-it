import { json } from '@remix-run/node';

export const loader = () => {
  return json(null, { status: 404 });
};

// Generic 404 page
export default function SearchIndex() {
  return (
    <div>
      <p className='text-center mt-4 text-lg'>
        404 | La URL introducida no es correcta. Revísela e inténtelo
        nuevamente!
      </p>
    </div>
  );
}
