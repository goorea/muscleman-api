import { DocumentType } from '@typegoose/typegoose';

import { JWTResponse } from '@src/resolvers/types/JWTResponse';

import { User } from '../User';

export interface UserMethods {
  getJWTToken: (
    this: DocumentType<User, UserQueryHelpers>,
    device_id: string,
  ) => Promise<JWTResponse>;
}

export interface UserQueryHelpers {}
