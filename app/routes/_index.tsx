import { defer } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import * as Slider from 'react-slick';
import { CarouselItemCard } from '~/components/cards/carousel-item-card';
import { CarouselItemCardSkeleton } from '~/components/styles/carousel-item-card-skeleton';
import { FallbackLoader } from '~/components/styles/fallback-loader';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { getAllTrackedItems } from '~/services/tracking/get-all-tracked-items.service';
import { errorMsgs } from '~/utils/const';

const Slider2 = Slider.default.default;

const sliderSettings: Slider.Settings = {
  // autoplay: true,
  infinite: true,
  speed: 500,
  arrows: false,
  swipeToSlide: true,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplaySpeed: 2500,
};

type LoaderResponse = {
  ok: boolean;
  error?: string;
  trackedItemsPromise?: Promise<TrackingResponse[]>;
};

export const loader = async () => {
  try {
    const trackedItemsPromise = getAllTrackedItems();
    return defer({
      ok: true,
      trackedItemsPromise,
    });
  } catch (err) {
    console.log('ERROR GETTING TRACKED ITEMS', err);
    return defer({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
};

// TODO: use react slick and use a carousel of tracked items
// displaying some last prices, img (link to /item/:id) and name
export default function Index() {
  const { trackedItemsPromise, ok, error } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    // TODO: Show toast
    return <div>Error: {error}</div>;
  }

  return (
    <div className='mt-4 rounded-lg px-1 py-4 text-slate-700 max-w-6xl mx-auto'>
      <Suspense
        fallback={
          <Slider2 {...sliderSettings}>
            {Array.from({ length: 3 }, (_, index) => (
              <CarouselItemCardSkeleton key={index} />
            ))}
          </Slider2>
        }
      >
        <Await resolve={trackedItemsPromise as Promise<TrackingResponse[]>}>
          {(resolvedData) => (
            <Slider2 {...sliderSettings} autoplay={true}>
              {resolvedData.map((item) => (
                <CarouselItemCard key={item.url} item={item} />
              ))}
            </Slider2>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
