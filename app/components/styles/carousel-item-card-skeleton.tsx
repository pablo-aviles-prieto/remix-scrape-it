import Skeleton from 'react-loading-skeleton';

export const CarouselItemCardSkeleton = () => {
  return (
    <div className='shadow-lg m-2 h-[36rem] rounded-lg bg-white'>
      <div className='h-[50%] overflow-hidden rounded-lg'>
        <Skeleton height='90%' width='91%' className='ml-4 mt-4 rounded-lg' />
      </div>
      <div className='p-4 pt-2 h-[50%] flex flex-col justify-between'>
        <div>
          <p className='text-indigo-600 font-semibold min-h-[4.5rem]'>
            <Skeleton height={72} width='100%' />
          </p>
          <div className='text-sm my-2'>
            <Skeleton height={120} width={334} />
          </div>
        </div>
        <div className='flex justify-between'>
          <Skeleton height={42} width={144} />
          <Skeleton height={42} width={129} />
        </div>
      </div>
    </div>
  );
};
