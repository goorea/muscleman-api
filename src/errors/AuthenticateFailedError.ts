import { ApolloError } from 'apollo-server';

export default class AuthenticateFailedError extends ApolloError {
  constructor() {
    super('사용자 정보가 올바르지 않습니다.', 'AUTHENTICATE_FAILED_ERROR');

    Object.defineProperty(this, 'name', {
      value: 'AuthenticateFailedError',
    });
  }
}
