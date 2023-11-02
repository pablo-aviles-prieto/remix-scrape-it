import type { Document, ObjectId } from 'mongoose';

type IPrices = {
  date: Date;
  price: number;
};

export interface ITracking {
  _id: ObjectId;
  name: string;
  url: string;
  image: string;
  prices: IPrices[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IDocTracking = Document & ITracking;
