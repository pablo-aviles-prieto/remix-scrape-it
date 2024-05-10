export const errorMsgs = {
  internalError: 'There has been an internal error. Please try again later',
  genericError: 'There has been an error. Please try again later',
  invalidPayload: 'Check the data provided',
  invalidParams: 'Check the params provided',
  invalidId: 'Check the ID provided',
  invalidURL: 'Check the URL provided',
  invalidEmail: 'Check the email provided',
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
export const formatterUSNoDecimals = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export const availableCurrency = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
} as const;
