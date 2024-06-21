import { useCallback } from 'react';

export const useModifyDocumentTitle = () => {
  const modifyDocTitle = useCallback((title: string) => {
    document.title = title;
  }, []);

  return { modifyDocTitle };
};
