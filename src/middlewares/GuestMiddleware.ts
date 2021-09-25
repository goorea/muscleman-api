import { ForbiddenError, MiddlewareFn } from 'type-graphql';
import { Context } from '@src/context';

export const GuestMiddleware: MiddlewareFn<Context> = async (
  { context },
  next,
) => {
  if (context && context.user) {
    throw new ForbiddenError();
  }

  return await next();
};
