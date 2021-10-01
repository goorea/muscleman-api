import { buildSchema } from 'type-graphql';
import { TypegooseMiddleware } from '@src/middlewares/TypegooseMiddleware';
import { GraphQLSchema } from 'graphql';
import '@src/types/enums';
import { authChecker } from '@src/auth-checker';
import { ObjectIdScalar } from '@src/scalars/ObjectIdScalar';
import { mongoose } from '@typegoose/typegoose';

export const schema: Promise<GraphQLSchema> = buildSchema({
  resolvers: [__dirname + '/**/resolvers/*Resolver.{ts,js}'],
  globalMiddlewares: [TypegooseMiddleware],
  scalarsMap: [{ type: mongoose.Types.ObjectId, scalar: ObjectIdScalar }],
  authChecker,
});
