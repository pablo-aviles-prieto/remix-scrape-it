import type { Page } from 'playwright';
import { SCRAP_ELEMENT_COUNT } from './const';

const STEP_DISTANCE_IN_PX = 100;

export async function scrollIncrementally(page: Page) {
  await page.evaluate(
    ({
      SCRAP_ELEMENT_COUNT,
      STEP_DISTANCE_IN_PX,
    }: {
      SCRAP_ELEMENT_COUNT: number;
      STEP_DISTANCE_IN_PX: number;
    }) => {
      return new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          const elements = document.querySelectorAll(
            'div.search-item-card-wrapper-gallery'
          );
          const totalScrollHeight = document.documentElement.scrollHeight;
          const currentScrollPosition = window.scrollY + window.innerHeight;
          if (
            elements.length >= SCRAP_ELEMENT_COUNT ||
            currentScrollPosition >= totalScrollHeight
          ) {
            clearInterval(timer);
            resolve();
          } else {
            window.scrollBy(0, STEP_DISTANCE_IN_PX);
          }
        }, 100);
      });
    },
    { SCRAP_ELEMENT_COUNT, STEP_DISTANCE_IN_PX }
  );
}
