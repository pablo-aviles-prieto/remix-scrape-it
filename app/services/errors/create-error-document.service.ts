import type { IError } from '~/interfaces/error-schema';
import ErrorModel from '~/models/errors';

export const createErrorDocument = async (params: Partial<IError>) => {
  try {
    const newError = await ErrorModel.create(params);
    return newError.toJSON();
  } catch (err) {
    console.log(
      `${new Date()}:: Error inserting error document into DB: ${
        err instanceof Error ? err.message : err
      }`,
    );
  }
};
