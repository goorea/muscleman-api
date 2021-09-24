import { ForbiddenError as ApolloForbiddenError } from 'apollo-server';

export default class ForbiddenError extends ApolloForbiddenError {
  constructor() {
    super('접근 불가! 이 작업에 대한 권한이 없습니다!');
  }
}
