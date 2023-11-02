import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';
import type { IDocTracking } from '~/interfaces/tracking-schema';

const PriceSchema: Schema = new Schema({
  date: { type: Date, required: true },
  price: { type: Number, required: true },
});

const TrackingSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    image: { type: String, required: true },
    prices: [PriceSchema],
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

TrackingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: Document, ret: Record<string, any>) => {
    if ('_id' in doc) {
      delete ret._id;
    }
  },
});

export default model<IDocTracking>('trackings', TrackingSchema);
