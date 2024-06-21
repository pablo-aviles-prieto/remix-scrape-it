import { chromium } from 'playwright';

export const getBrowser = () => {
  return chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
    chromiumSandbox: false,
  });
};
