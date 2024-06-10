import type { Document, Model } from 'mongoose';
import { Schema, model } from 'mongoose';
import type { IDocTracking } from '~/interfaces/tracking-schema';
import { modelExists } from '~/utils/check-model-exist';

const PriceSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    price: { type: String, required: true },
  },
  {
    _id: false,
  }
);

const DesiredPriceSubscribersSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    desiredPrice: { type: String, required: true },
  },
  {
    _id: false,
  }
);

const TrackingSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    image: { type: String, required: true },
    prices: [PriceSchema],
    subscribers: { type: [String], default: [] },
    currency: { type: String, required: true },
    lastSubscriberUpdate: { type: Date, required: true },
    desiredPriceSubscribers: [DesiredPriceSubscribersSchema],
    store: { type: String, required: true },
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

let TrackingModel: Model<IDocTracking>;

if (modelExists('trackings')) {
  TrackingModel = model<IDocTracking>('trackings');
} else {
  TrackingModel = model<IDocTracking>('trackings', TrackingSchema);
}

export default TrackingModel;
