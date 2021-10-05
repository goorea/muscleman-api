import { verify } from '@src/plugins/jwt';
import { ContextFunction } from 'apollo-server-core/src/types';
import { ExpressContext } from 'apollo-server-express/src/ApolloServer';
import { User, UserModel } from '@src/models/User';
import { UserQueryHelpers } from '@src/models/types/User';
import { DocumentType } from '@typegoose/typegoose';

export interface Context {
  user?: DocumentType<User, UserQueryHelpers>;
}

export const context: ContextFunction<ExpressContext, Context> = async ({
  req: {
    headers: { authorization },
  },
}) => {
  const filter = authorization
    ? verify(authorization.replace('Bearer ', ''))
    : undefined;
  const user = filter
    ? (await UserModel.findOne(filter).exec()) || undefined
    : undefined;

  return { user };
};
