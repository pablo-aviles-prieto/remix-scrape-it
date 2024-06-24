export const errorMsgs = {
  internalError: 'There has been an internal error. Please try again later',
  genericError: 'There has been an error. Please try again later',
  invalidPayload: 'Check the data provided',
  invalidParams: 'Check the params provided',
  invalidId: 'Check the ID provided',
  invalidURL: 'Check the URL provided',
  invalidEmail: 'Revise el email facilitado',
  invalidPrice: 'Revise el precio indicado',
  invalidDesiredPrice:
    'El precio indicado es mayor o igual al precio actual del producto',
};

export const COOLMOD_BASE_RUL = 'https://www.coolmod.com/';
export const ALIEXPRESS_BASE_URL = 'https://es.aliexpress.com/';
export const ALIEXPRESS_HOSTNAME = 'es.aliexpress.com';
export const THOMANN_BASE_URL = 'https://www.thomann.de/';
export const THOMANN_INTL_URL = 'https://www.thomann.de/intl/';

export const dateFormat = {
  euWithTime: 'dd/MM/yyyy HH:mm',
};

export const SIMPLE_REGEX_EMAIL = /\S+@\S+/;

export const formatterUSTwoDecimals = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const availableCurrency = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
} as const;

export const getEllipsed = 'overflow-hidden text-ellipsis whitespace-nowrap';

export enum stores {
  ALIEXPRESS = 'Aliexpress',
  COOLMOD = 'Coolmod',
  THOMANN = 'Thomann',
}

export const COOLMOD_REGEX = /^(https:\/\/)?(www\.)?coolmod\.com/;
export const ALIEXPRESS_REGEX =
  /^(https:\/\/)?(www\.)?([a-z]{2}\.)?aliexpress\.com/;
export const THOMANN_REGEX = /^(https:\/\/)?(www\.)?thomann\.de/;
export const THOMANN_COUNTRY_CODE_REGEX =
  /https:\/\/www\.thomann\.de\/[a-z]{2}\//;

export const SCRAP_ELEMENT_COUNT = 30;
export const DEFAULT_TIMEOUT_SELECTOR = 5000;

export const RON_CONVERSION_RATE_TO_EURO = 0.20090637;
