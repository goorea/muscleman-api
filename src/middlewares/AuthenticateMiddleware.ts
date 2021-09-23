import { MiddlewareFn, UnauthorizedError } from 'type-graphql';
import { Context } from '@src/context';

export const AuthenticateMiddleware: MiddlewareFn<Context> = async (
  { context },
  next,
) => {
  if (!context || !context.user) {
    throw new UnauthorizedError();
  }

  return await next();
};
