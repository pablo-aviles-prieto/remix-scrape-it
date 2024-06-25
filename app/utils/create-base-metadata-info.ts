import type { MetaFunction } from '@remix-run/node';
import { stores } from './const';

export const createBaseMetadataInfo: MetaFunction = () => {
  const supportedStores = Object.values(stores);
  const storeList = supportedStores.join(', ');
  const description = `ScrapeIt! te permite rastrear y seguir los precios de los productos de tus tiendas favoritas como ${storeList}. Crea seguimientos para tus productos favoritos y recibe actualizaciones diarias por correo electrónico sobre los últimos precios o cuando el producto llegue al precio que deseas.`;
  const titleData =
    'ScrapeIt! - Consigue los mejores precios de tus tiendas favoritas';

  return [
    { title: titleData },
    { name: 'description', content: description },
    { property: 'og:title', content: titleData },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.scrapeit.pabloaviles.es/' },
    {
      property: 'og:image',
      content:
        'https://www.scrapeit.pabloaviles.es/images/scrapeit_social_network.webp',
    },
  ];
};
