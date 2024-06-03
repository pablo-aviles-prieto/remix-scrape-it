const MIN_PIXELS_TO_SCROLL = 2000; // to retrieve a bit more than 30 items in aliexpress

export const scrollPageByPercentage = async ({
  page,
  percentage,
}: {
  page: any;
  percentage: number;
}) => {
  await page.evaluate((percent: number) => {
    const totalScrollHeight = document.documentElement.scrollHeight;
    const scrolledPixelsOnProvidedPercent = totalScrollHeight * (percent / 100);

    /*
     * If the total scroll height is smaller than the MIN PIXELS, scroll the total height.
     * Otherwise, check if the provided percent pixels are smaller than the MIN PIXELS:
     * - If true, scroll the min pixels.
     * - If false, scroll the pixels demanded by the percent provided.
     */
    const pixelsToScroll =
      totalScrollHeight <= MIN_PIXELS_TO_SCROLL
        ? totalScrollHeight
        : scrolledPixelsOnProvidedPercent <= MIN_PIXELS_TO_SCROLL
        ? MIN_PIXELS_TO_SCROLL
        : scrolledPixelsOnProvidedPercent;

    window.scrollBy(0, pixelsToScroll);
  }, percentage);
};
