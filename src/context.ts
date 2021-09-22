import { verify } from '@src/plugins/jwt';
import { ContextFunction } from 'apollo-server-core/src/types';
import { ExpressContext } from 'apollo-server-express/src/ApolloServer';
import { User } from '@src/models/User';

export interface Context {
  user?: Partial<User>;
}

export const context: ContextFunction<ExpressContext, Context> = ({ req }) => ({
  user: verify(req.headers.authorization || ''),
});
