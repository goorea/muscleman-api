import { ApolloError } from 'apollo-server';

export default class VerifiedError extends ApolloError {
  constructor() {
    super('이미 인증된 이메일 입니다.', 'VERIFIED_ERROR');

    Object.defineProperty(this, 'name', {
      value: 'VerifiedError',
    });
  }
}
