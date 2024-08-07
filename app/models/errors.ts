import type { Document, Model } from 'mongoose';
import { Schema, model } from 'mongoose';
import type { IDocError } from '~/interfaces/error-schema';
import { modelExists } from '~/utils/check-model-exist';

const ErrorSchema: Schema = new Schema(
  {
    message: { type: String },
    responseMessage: { type: String, required: true },
    store: { type: String },
    notifiedByEmail: { type: Boolean, required: true, default: false },
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

if (modelExists('errors')) {
  ErrorModel = model<IDocError>('errors');
} else {
  ErrorModel = model<IDocError>('errors', ErrorSchema);
}

export default ErrorModel;
