import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from '@src/graphql/typeDefs';
import resolvers from '@src/graphql/resolvers';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
