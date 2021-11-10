import { MiddlewareFn } from 'type-graphql';

import { Context } from '@src/context';
import AuthenticationError from '@src/errors/AuthenticationError';

export const AuthenticateMiddleware: MiddlewareFn<Context> = async (
  { context },
  next,
) => {
  if (!context || !context.user) {
    throw new AuthenticationError();
  }

  return await next();
};
