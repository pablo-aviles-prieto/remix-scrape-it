import { Link } from '@remix-run/react';
import { Button, Heading } from 'evergreen-ui';

interface ErrorRetrieveDataProps {
  children: React.ReactNode;
}

export const ErrorRetrieveData = ({ children }: ErrorRetrieveDataProps) => {
  return (
    <div className='flex flex-col gap-y-4 items-center'>
      <Heading color='tomato' size={500}>
        {children}
      </Heading>
      <Button
        color='whitesmoke'
        className='!bg-indigo-600 hover:!bg-indigo-500 max-w-[250px]'
        type='button'
        fontSize='small'
      >
        <Link prefetch='intent' to='/'>
          Volver atrás
        </Link>
      </Button>
    </div>
  );
};
