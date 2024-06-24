import { THOMANN_COUNTRY_CODE_REGEX, THOMANN_INTL_URL } from './const';

export const normalizeThomannUrl = (url: string): string => {
  if (url.startsWith(THOMANN_INTL_URL)) {
    return url; // The URL is already in the intl format
  }
  return url.replace(THOMANN_COUNTRY_CODE_REGEX, THOMANN_INTL_URL);
};
