import type { MetaFunction } from '@remix-run/node';
import { stores } from './const';

// TODO: Add OG to the metadata base
export const createBaseMetadataInfo: MetaFunction = () => {
  const supportedStores = Object.values(stores);
  const storeList = supportedStores.join(', ');
  return [
    {
      title:
        'ScrapeIt! - Consigue los mejores precios de tus tiendas favoritas',
    },
    {
      name: 'description',
      content: `ScrapeIt! te permite rastrear y seguir los precios de los productos de tus tiendas favoritas como ${storeList}. Crea seguimientos para tus productos favoritos y recibe actualizaciones diarias por correo electrónico sobre los últimos precios o cuando el producto llegue al precio que deseas.`,
    },
  ];
};
