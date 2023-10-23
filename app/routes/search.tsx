import { Outlet } from '@remix-run/react';

export default function Test() {
  return (
    <div>
      <div>
        Search outlet page - Contenedor de los searches (enseñara o bien /search
        que es la busqueda por palabra o /serach/:item que es enseñar el detalle
        de un item ya buscado
      </div>
      <Outlet />
    </div>
  );
}
