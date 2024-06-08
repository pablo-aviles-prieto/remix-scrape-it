const TARGET_ELEMENT_COUNT = 30;
const STEP_DISTANCE_IN_PX = 100;

// TODO: type page correctly
export async function scrollIncrementally(page: any) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        const elements = document.querySelectorAll(
          'div.search-item-card-wrapper-gallery'
        );
        if (elements.length >= TARGET_ELEMENT_COUNT) {
          clearInterval(timer);
          resolve();
        } else {
          window.scrollBy(0, STEP_DISTANCE_IN_PX);
        }
      }, 100);
    });
  });
}
