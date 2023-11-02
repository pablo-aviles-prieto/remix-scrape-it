import { useNavigation } from '@remix-run/react';
import { Spinner } from 'evergreen-ui';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';

/*
 * Wrapper to trigger the Suspense fallback by re-mounting the Suspense
 * and Await components on the children
 */
export const LoaderWrapper = ({ children }: { children: ReactNode }) => {
  const [isLoading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    setLoading(
      navigation.state === 'loading' || navigation.state === 'submitting'
    );
  }, [navigation]);

  return isLoading ? (
    <div className='absolute top-0 left-0 bottom-0 right-0 bg-transparent z-10'>
      <Spinner size={128} marginX='auto' marginY={425} />
    </div>
  ) : (
    <>{children}</>
  );
};
