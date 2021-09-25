import { AuthChecker } from 'type-graphql';
import { Context } from '@src/context';

export const authChecker: AuthChecker<Context> = (
  { context: { user } },
  roles,
) => {
  if (roles.length === 0) {
    return user !== undefined;
  }

  return Boolean(user?.roles.some(role => roles.includes(role)));
};
