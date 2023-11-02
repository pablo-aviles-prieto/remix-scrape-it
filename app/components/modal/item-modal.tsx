import { CloseBtn } from '../styles/icons/close-btn';
import { RegularButton } from '../styles/regular-button';

type Props = {
  itemName: string;
  actualPrice: string;
  imgPath: string;
  oldPrice?: string;
  discount?: string;
  urlItem: string;
  onClose: () => void;
};

export const ItemModal = ({
  itemName,
  actualPrice,
  imgPath,
  oldPrice,
  discount,
  urlItem,
  onClose,
}: Props) => {
  return (
    <div>
      <div className='flex gap-8 items-center justify-between'>
        <h3 className='line-clamp-1 text-slate-900 text-lg font-semibold'>
          {itemName}
        </h3>
        <CloseBtn
          className='cursor-pointer text-slate-600 hover:text-indigo-400'
          width={40}
          height={40}
          onClick={onClose}
        />
      </div>
      <div className='my-16'>
        <div className='flex items-center max-h-[12rem] overflow-hidden'>
          <div className='w-[50%]'>
            <img
              src={imgPath}
              alt={itemName}
              className='object-cover w-full h-full'
            />
          </div>
          <div className='w-[50%] ml-2 text-xs font-bold flex flex-col gap-3'>
            <p className='text-base font-normal'>{itemName}</p>
            <p>
              Precio:{' '}
              <span
                className={`text-lg font-bold ${
                  oldPrice ? 'text-green-700' : 'text-slate-800'
                }`}
              >
                {actualPrice}
              </span>
              {oldPrice && discount && (
                <span>
                  {' '}
                  sin dto:{' '}
                  <span className='text-base relative font-semibold'>
                    <span className='line-through text-red-800 font-bold italic'>
                      {oldPrice}
                    </span>
                    <span className='text-xs text-slate-900 absolute top-[2px] -right-[25px]'>
                      {discount}
                    </span>
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>
        <div className='mt-2'>
          <p className='text-center'>No hay seguimiento para este producto</p>
        </div>
      </div>
      <div className='flex justify-between mb-1'>
        <RegularButton content='Cerrar' onClick={onClose} color='secondary' />
        {/* Mostrar 'crear seguimiento' o 'ver seguimiento' */}
        {/* Solo debe aparecer mas detalles si ya hay creado un seguimiento */}
        <RegularButton
          content='Ver seguimiento'
          onClick={() => console.log('Link to /item/:id')}
        />
        <RegularButton
          content='Crear seguimiento'
          onClick={() =>
            console.log(
              'Endpoint que cree el seguimiento. Redirect to the created id'
            )
          }
        />
      </div>
    </div>
  );
};
