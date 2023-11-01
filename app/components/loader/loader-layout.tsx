import { Outlet, useNavigation } from '@remix-run/react';
import { useState, useEffect } from 'react';

export const LoaderLayout = () => {
  const [isLoading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    setLoading(navigation.state === 'loading');
  }, [navigation]);

  return isLoading ? <div>Spinner goes here...</div> : <Outlet />;
};
