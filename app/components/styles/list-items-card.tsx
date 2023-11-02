import { Position, Tooltip } from 'evergreen-ui';
import type { ListItemsCoolmod } from '~/interfaces/item-coolmod';

type Props = {
  item: ListItemsCoolmod;
};

export const ListItemsCard = ({ item }: Props) => {
  return (
    <div className='w-full relative shadow-md rounded-lg overflow-hidden'>
      <img
        src={
          item.imgPath ??
          'https://static.vecteezy.com/system/resources/previews/007/126/739/non_2x/question-mark-icon-free-vector.jpg'
        }
        alt={item.name}
        className='w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform'
      />
      <div
        className='absolute bottom-0 left-0 right-0 h-30 bg-slate-900 bg-opacity-70 
    backdrop-blur-[3px] text-white p-2 rounded-b-lg'
      >
        <Tooltip content={item.name} position={Position.TOP}>
          <h1 className='text-sm font-semibold overflow-hidden line-clamp-1'>
            {item.name}
          </h1>
        </Tooltip>
        <div className='pt-1 flex items-center justify-between'>
          <p className='text-xl'>{item.price}</p>
          <a
            href={item.url ?? ''}
            target='_blank'
            rel='noopener noreferrer'
            className='underline hover:text-indigo-300'
          >
            Visitar página
          </a>
        </div>
      </div>
    </div>
  );
};
