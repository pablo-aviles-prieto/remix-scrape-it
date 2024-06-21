import type { MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { createBaseMetadataInfo } from '~/utils/create-base-metadata-info';

export const meta: MetaFunction = (ServerRuntimeMetaArgs) => {
  const metadata = createBaseMetadataInfo(ServerRuntimeMetaArgs);
  // removing the base metadata title
  const filteredMetadata = metadata.filter(
    (metaItem) => !metaItem.hasOwnProperty('title')
  );
  return [
    {
      title: 'ScrapeIt! - Página no encontrada',
    },
    ...filteredMetadata,
  ];
};

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
