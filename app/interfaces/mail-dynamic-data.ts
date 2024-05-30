export interface DailyMailDynamicData {
  productName: string;
  productImage: string;
  productUrl: string; // using the scrapeit url, not coolmod
  unsubscribeUrl: string;
  prices: {
    date: string;
    price: string;
  }[];
}

export interface ProductAvailableMailDynamicData {
  productName: string;
  productPrice: string;
  productUrl: string; // using the coolmod url
  productImage: string;
}
