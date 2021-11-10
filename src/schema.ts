import { mongoose } from '@typegoose/typegoose';
import { GraphQLSchema } from 'graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { buildSchema } from 'type-graphql';

import '@src/types/enums';
import { authChecker } from '@src/auth-checker';
import { ErrorInterceptor } from '@src/middlewares/ErrorInterceptorMiddleware';
import { TypegooseMiddleware } from '@src/middlewares/TypegooseMiddleware';
import { ObjectIdScalar } from '@src/scalars/ObjectIdScalar';

export const schema: Promise<GraphQLSchema> = buildSchema({
  resolvers: [__dirname + '/**/resolvers/*Resolver.{ts,js}'],
  globalMiddlewares: [TypegooseMiddleware, ErrorInterceptor],
  scalarsMap: [
    { type: mongoose.Types.ObjectId, scalar: ObjectIdScalar },
    { type: Object, scalar: GraphQLJSONObject },
  ],
  authChecker,
});
