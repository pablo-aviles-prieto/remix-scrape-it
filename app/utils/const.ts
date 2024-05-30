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
  COOLMOD = 'Coolmod',
  ALIEXPRESS = 'Aliexpress',
}
