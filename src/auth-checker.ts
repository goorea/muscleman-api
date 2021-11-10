import { AuthChecker } from 'type-graphql';

import { Context } from '@src/context';
import AuthenticationError from '@src/errors/AuthenticationError';
import ForbiddenError from '@src/errors/ForbiddenError';

export const authChecker: AuthChecker<Context> = (
  { context: { user } },
  roles,
) => {
  if (user === undefined) {
    throw new AuthenticationError();
  }

  if (user.roles.every(role => !roles.includes(role))) {
    throw new ForbiddenError();
  }

  return true;
};
