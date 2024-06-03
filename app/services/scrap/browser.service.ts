import { chromium } from 'playwright';

export const getBrowser = () => {
  return chromium.launch({
    headless: false,
    args: ['--no-sandbox'],
    chromiumSandbox: false,
  });
};
