import { ApolloError } from 'apollo-server';

export default class ForbiddenError extends ApolloError {
  constructor() {
    super('접근 불가! 이 작업에 대한 권한이 없습니다.', 'FORBIDDEN_ERROR');

    Object.defineProperty(this, 'name', {
      value: 'ForbiddenError',
    });
  }
}
