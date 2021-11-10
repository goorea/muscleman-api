import { mongoose } from '@typegoose/typegoose';
import { GraphQLScalarType, Kind } from 'graphql';

import ObjectId = mongoose.Types.ObjectId;

export const ObjectIdScalar = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'Mongoose의 ObjectID 스칼라 타입',
  serialize(value: unknown): string {
    if (!(value instanceof ObjectId)) {
      throw new Error('ObjectIdScalar는 ObjectId 값만 직렬화할 수 있습니다');
    }

    return value.toHexString();
  },
  parseValue(value: unknown): ObjectId {
    if (typeof value !== 'string') {
      throw new Error('ObjectIdScalar는 오직 문자열만 분석할 수 있습니다');
    }

    return new ObjectId(value);
  },
  parseLiteral(ast): ObjectId {
    if (ast.kind !== Kind.STRING) {
      throw new Error('ObjectIdScalar는 오직 문자열만 분석할 수 있습니다');
    }

    return new ObjectId(ast.value);
  },
});
