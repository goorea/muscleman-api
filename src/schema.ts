import { buildSchema } from 'type-graphql';
import { TypegooseMiddleware } from '@src/middlewares/TypegooseMiddleware';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@src/scalars/ObjectIdScalar';
import { GraphQLSchema } from 'graphql';
import '@src/types/enums';
import { authChecker } from '@src/auth-checker';

export const schema: Promise<GraphQLSchema> = buildSchema({
  resolvers: [__dirname + '/**/resolvers/*Resolver.{ts,js}'],
  globalMiddlewares: [TypegooseMiddleware],
  scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
  authChecker,
});
