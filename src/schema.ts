import { buildSchema } from 'type-graphql';
import { TypegooseMiddleware } from '@src/middlewares/TypegooseMiddleware';
import { GraphQLSchema } from 'graphql';
import '@src/types/enums';
import { authChecker } from '@src/auth-checker';
import { ObjectIdScalar } from '@src/scalars/ObjectIdScalar';
import { mongoose } from '@typegoose/typegoose';
import { ErrorInterceptor } from '@src/middlewares/ErrorInterceptorMiddleware';

export const schema: Promise<GraphQLSchema> = buildSchema({
  resolvers: [__dirname + '/**/resolvers/*Resolver.{ts,js}'],
  globalMiddlewares: [TypegooseMiddleware, ErrorInterceptor],
  scalarsMap: [{ type: mongoose.Types.ObjectId, scalar: ObjectIdScalar }],
  authChecker,
});
