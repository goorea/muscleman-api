import { DocumentType } from '@typegoose/typegoose';

import { JWTResponse } from '@src/resolvers/types/JWTResponse';

import { User } from '../User';

export interface UserMethods {
  getJWTToken: (
    this: DocumentType<User, UserQueryHelpers>,
    deviceID: string,
  ) => Promise<JWTResponse>;
}

export interface UserQueryHelpers {}
