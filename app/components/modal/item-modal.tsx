import type { SingleItemCoolmod } from '~/interfaces/item-coolmod';
import { CloseBtn } from '../styles/icons/close-btn';
import { RegularButton } from '../styles/regular-button';

type Props = {
  item: SingleItemCoolmod;
  urlItem: string;
  onClose: () => void;
};

export const ItemModal = ({ item, urlItem, onClose }: Props) => {
  const { itemName, actualPrice, imgPath, oldPrice, discount } = item;
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
      <div className='my-6'>
        <div className='flex items-center max-h-[12rem] overflow-hidden'>
          <div className='w-[50%]'>
            <img
              src={imgPath}
              alt={itemName}
              className='object-cover w-full h-full'
            />
          </div>
          <div className='w-[50%] text-xs font-bold'>
            <p className='line-clamp-2'>
              Nombre: <span className='text-base font-normal'>{itemName}</span>
            </p>
            <p>
              Precio:{' '}
              <span className='text-base font-normal'>{actualPrice}</span>
            </p>
            {oldPrice && discount && (
              <p>
                Precio sin dto:{' '}
                <span>
                  {oldPrice} {discount}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className='mt-2'>
          <p className='text-center'>No hay seguimiento para este producto</p>
        </div>
      </div>
      <div className='flex justify-between mb-1'>
        {/* TODO: Invertir los colores */}
        <RegularButton content='Cerrar' onClick={onClose} />
        <RegularButton
          content='Más detalles'
          onClick={() => console.log('Mas detalles')}
        />
        <RegularButton
          content='Crear seguimiento'
          onClick={() => console.log('Crear seguimiento')}
        />
      </div>
    </div>
  );
};
