export interface MailDynamicData {
  productName: string;
  productImage: string;
  productUrl: string; // using the scrapeit url, not coolmod
  unsubscribeUrl: string;
  prices: {
    date: string;
    price: string;
  }[];
}
