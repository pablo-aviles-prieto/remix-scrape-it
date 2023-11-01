import { Outlet } from '@remix-run/react';

export default function Search() {
  return (
    <div>
      <div>
        Search outlet page - Contenedor de los searches - enseñara o bien
        /search que es la busqueda por palabra o /serach/:item que es enseñar el
        detalle de un item ya buscado
      </div>
      {/* TODO?: Extract this container as SearchLayout style component */}
      <div className='h-[1px] border border-b-gray-300 my-4' />
      <Outlet />
    </div>
  );
}
