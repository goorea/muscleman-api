import { ApolloError } from 'apollo-server';

export default class TokenExpiredError extends ApolloError {
  constructor(expiredAt: Date) {
    super('만료된 토큰입니다.', 'TOKEN_EXPIRED_ERROR', { expiredAt });

    Object.defineProperty(this, 'name', {
      value: 'TokenExpiredError',
    });
  }
}
