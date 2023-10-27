export type ItemCoolmod =
  | {
      itemName: string | undefined;
      actualPrice: string | undefined;
      currency: string | undefined;
      oldPrice?: string;
    }
  | undefined;
