export type SingleItemCoolmod = {
  itemName: string | undefined;
  actualPrice: string | undefined;
  currency: string | undefined;
  imgPath: string | undefined;
  oldPrice?: string;
  discount?: string;
};

export type ListItemsCoolmod = {
  name: string | undefined;
  url: string | null | undefined;
  imgPath: string | null | undefined;
  price: string | undefined;
  currency: string;
};
