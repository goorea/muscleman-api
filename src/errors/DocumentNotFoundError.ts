import { ApolloError } from 'apollo-server';

export default class DocumentNotFoundError extends ApolloError {
  constructor() {
    super('문서를 찾을 수 없습니다.', 'DOCUMENT_NOT_FOUND_ERROR');

    Object.defineProperty(this, 'name', {
      value: 'DocumentNotFoundError',
    });
  }
}
