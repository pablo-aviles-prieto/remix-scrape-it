import type { Document, Model } from 'mongoose';
import { Schema, model } from 'mongoose';
import type { IDocError } from '~/interfaces/error-schema';
import { modelExists } from '~/utils/check-model-exist';

const ErrorSchema: Schema = new Schema(
  {
    message: { type: String },
    responseMessage: { type: String, required: true },
    store: { type: String },
    notifiedByEmail: { type: Boolean, required: true },
    searchValue: { type: String },
  },
  { timestamps: true }
);

ErrorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: Document, ret: Record<string, any>) => {
    if ('_id' in doc) {
      delete ret._id;
    }
  },
});

let ErrorModel: Model<IDocError>;

if (modelExists('trackings')) {
  ErrorModel = model<IDocError>('trackings');
} else {
  ErrorModel = model<IDocError>('trackings', ErrorSchema);
}

export default ErrorModel;
