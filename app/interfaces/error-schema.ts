import type { Document, ObjectId } from 'mongoose';
import type { stores } from '~/utils/const';

export interface IError {
  _id: ObjectId;
  message?: string;
  responseMessage: string;
  store: stores;
  notifiedByEmail: boolean;
  searchValue?: string;
}

export interface ErrorResponse extends Omit<IError, '_id'> {
  id: string;
}

export type IDocError = Document & IError;
