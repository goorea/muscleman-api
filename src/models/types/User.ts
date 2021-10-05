import { DocumentType } from '@typegoose/typegoose';
import { LoginResponse } from '@src/resolvers/types/LoginResponse';
import { User } from '@src/models/User';

export interface UserMethods {
  getJWTToken: (
    this: DocumentType<User, UserQueryHelpers>,
  ) => Promise<LoginResponse>;
}

export interface UserQueryHelpers {}
