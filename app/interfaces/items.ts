export type SingleItem = {
  itemName: string | undefined;
  actualPrice: string | undefined;
  currency: string | undefined;
  imgPath: string | undefined;
  oldPrice?: string;
  discount?: string;
};

export type ListItems = {
  name: string | undefined;
  url: string | null | undefined;
  imgPath: string | null | undefined;
  currency: string;
  price: string;
  discountedPrice?: string | number | undefined;
  discountPercent?: string | undefined;
};
