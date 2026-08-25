import { defer, json } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import * as Slider from 'react-slick';
import { CarouselItemCard } from '~/components/cards/carousel-item-card';
import { CarouselItemCardSkeleton } from '~/components/styles/carousel-item-card-skeleton';
import useWindowWidth from '~/hooks/use-window-width';
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

const SLIDER_TWO_SLIDES_BELOW = 1100;
const SLIDER_ONE_SLIDE_BELOW = 800;

const getSlidesToShow = (width?: number) => {
  if (width === undefined || width >= SLIDER_TWO_SLIDES_BELOW) return 3;
  if (width >= SLIDER_ONE_SLIDE_BELOW) return 2;
  return 1;
};

export default function Index() {
  const { trackedItemsPromise, ok, error } = useLoaderData<LoaderResponse>();
  const innerWidth = useWindowWidth();
  const slidesToShow = getSlidesToShow(innerWidth);

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
    arrows: true,
    swipeToSlide: true,
    slidesToShow,
    slidesToScroll: 1,
    autoplaySpeed: 2_500,
    responsive: [
      {
        breakpoint: SLIDER_TWO_SLIDES_BELOW,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: SLIDER_ONE_SLIDE_BELOW,
        settings: {
          arrows: false,
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
            {Array.from({ length: slidesToShow }, (_, index) => (
              <CarouselItemCardSkeleton key={index} />
            ))}
          </Slider2>
        }
      >
        <Await resolve={trackedItemsPromise as Promise<TrackingResponse[]>}>
          {(resolvedData) =>
            resolvedData.length >= 3 ? (
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
