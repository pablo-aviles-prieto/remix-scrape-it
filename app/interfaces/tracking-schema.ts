import type { Document, ObjectId } from 'mongoose';
import type { stores } from '~/utils/const';

export type IPrices = {
  date: Date;
  price: string;
};

export type IDesiredPriceSubscribers = {
  email: string;
  desiredPrice: string;
};

export interface ITracking {
  _id: ObjectId;
  name: string;
  url: string;
  image: string;
  prices: IPrices[];
  subscribers: string[];
  currency: string;
  lastSubscriberUpdate: Date;
  desiredPriceSubscribers: IDesiredPriceSubscribers[];
  store: stores;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingResponse extends Omit<ITracking, '_id'> {
  id: string;
}

export type IDocTracking = Document & ITracking;
