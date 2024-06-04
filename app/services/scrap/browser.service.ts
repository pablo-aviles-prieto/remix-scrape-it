import { chromium } from 'playwright';

export const getBrowser = () => {
  return chromium.launch({
    // TODO: Change to true
    headless: false,
    args: ['--no-sandbox'],
    chromiumSandbox: false,
  });
};
