import { ArgumentValidationError, MiddlewareFn } from 'type-graphql';

import { Context } from '@src/context';
import ValidationError from '@src/errors/ValidationError';

export const ErrorInterceptor: MiddlewareFn<Context> = async (_, next) => {
  try {
    return await next();
  } catch (e) {
    if (e instanceof ArgumentValidationError) {
      throw new ValidationError();
    }

    throw e;
  }
};
