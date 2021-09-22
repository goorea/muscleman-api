import { buildSchema, registerEnumType } from 'type-graphql';
import { TypegooseMiddleware } from '@src/middlewares/TypegooseMiddleware';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@src/scalars/ObjectIdScalar';
import { GraphQLSchema } from 'graphql';
import { Gender } from '@src/types/enums';

registerEnumType(Gender, { name: 'Gender', description: '성별' });

export const schema: Promise<GraphQLSchema> = buildSchema({
  resolvers: [__dirname + '/**/resolvers/*Resolver.{ts,js}'],
  globalMiddlewares: [TypegooseMiddleware],
  scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
});
