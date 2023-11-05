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
  subscribers: string[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingResponse extends Omit<ITracking, '_id'> {
  id: string;
}

export type IDocTracking = Document & ITracking;
