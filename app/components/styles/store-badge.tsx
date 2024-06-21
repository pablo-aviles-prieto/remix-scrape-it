import { stores } from '~/utils/const';
import { AliexpressIcon } from './icons/stores/aliexpress';

type BadgeSizes = 'small' | 'medium' | 'large';

type Props = {
  storeImageInfo: StoreImageInfo;
  store: stores;
  size?: BadgeSizes;
};

interface SizesDetails {
  class: string;
  width: number;
  height: number;
}
type SizesMapper = Record<BadgeSizes, SizesDetails>;

export type StoreImageInfo =
  | { src: string; isImage: true }
  | {
      icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
      isImage: false;
    };

export const STORE_IMAGE_MAPPER = {
  [stores.COOLMOD]: { src: '/images/logo_coolmod.webp', isImage: true },
  [stores.ALIEXPRESS]: { icon: AliexpressIcon, isImage: false },
};

const isImageInfo = (
  info: StoreImageInfo
): info is { src: string; isImage: true } => {
  return info.isImage;
};

export const StoreBadge = ({
  storeImageInfo,
  store,
  size = 'small',
}: Props) => {
  const sizesMapper: SizesMapper = {
    small: { class: 'w-[97px] h-[21px]', width: 97, height: 21 },
    medium: { class: 'w-[135px] h-[30px]', width: 135, height: 30 },
    large: { class: 'w-[160px] h-[35px]', width: 160, height: 35 },
  };

  return (
    <div className='absolute top-0 left-0 bg-white p-0.5 rounded-lg'>
      {isImageInfo(storeImageInfo) ? (
        <img
          className={`object-cover ${sizesMapper[size].class}`}
          src={storeImageInfo.src}
          alt={`Logo ${store}`}
        />
      ) : (
        <storeImageInfo.icon
          width={sizesMapper[size].width}
          height={sizesMapper[size].height}
        />
      )}
    </div>
  );
};
