import { ValidationError as ApolloValidationError } from 'apollo-server';

export default class ValidationError extends ApolloValidationError {
  constructor() {
    super('유효성 검사에 실패했습니다.');
  }
}
