import { MiddlewareFn } from 'type-graphql';
import { Context } from '@src/context';
import { UserModel } from '@src/models/User';
import ForbiddenError from '@src/errors/ForbiddenError';

export const EnsureEmailIsVerifiedMiddleware: MiddlewareFn<Context> = async (
  { context },
  next,
) => {
  if (!context || !context.user) {
    throw new ForbiddenError();
  }

  const user = await UserModel.findById(context.user._id).exec();

  if (user === null || !user.hasVerifiedEmail) {
    throw new ForbiddenError();
  }

  return await next();
};
