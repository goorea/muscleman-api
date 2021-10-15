import { AuthenticationError as ApolloAuthenticationError } from 'apollo-server';

export default class AuthenticationError extends ApolloAuthenticationError {
  constructor() {
    super('접근 불가! 이 작업을 수행하려면 승인이 필요합니다.');
  }
}
