import { defer, json } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import * as Slider from 'react-slick';
import { CarouselItemCard } from '~/components/cards/carousel-item-card';
import { CarouselItemCardSkeleton } from '~/components/styles/carousel-item-card-skeleton';
import type { TrackingResponse } from '~/interfaces/tracking-schema';
import { getAllTrackedItems } from '~/services/tracking/get-all-tracked-items.service';
import { errorMsgs } from '~/utils/const';

// @ts-ignore
const Slider2 = Slider.default.default;

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
    return json({
      ok: false,
      error: errorMsgs.internalError,
    });
  }
};

export default function Index() {
  const { trackedItemsPromise, ok, error } = useLoaderData<LoaderResponse>();

  if (!ok && error) {
    return (
      <p className='text-center mt-4 text-lg'>
        Error al obtener los productos en seguimiento
      </p>
    );
  }

  const sliderSettings: Slider.Settings = {
    infinite: true,
    speed: 500,
    arrows: false,
    swipeToSlide: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplaySpeed: 2500,
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className='mt-4 text-slate-700 max-w-6xl mx-auto'>
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
          {(resolvedData) =>
            resolvedData.length > 3 ? (
              <Slider2 {...sliderSettings} autoplay={true}>
                {resolvedData.map((item) => (
                  <CarouselItemCard key={item.url} item={item} />
                ))}
              </Slider2>
            ) : null
          }
        </Await>
      </Suspense>
    </div>
  );
}
