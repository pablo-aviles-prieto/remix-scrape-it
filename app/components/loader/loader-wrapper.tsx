import { useNavigation } from '@remix-run/react';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { FallbackLoader } from '../styles/fallback-loader';

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

  return isLoading ? <FallbackLoader /> : <>{children}</>;
};
