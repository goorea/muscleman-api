import jwt from 'jsonwebtoken';
import { User } from '@src/models/User';
import randToken from 'rand-token';
import { ObjectId } from 'mongodb';
import { LoginResponse } from '@src/resolvers/types/LoginResponse';

export const sign = (user: User): LoginResponse => ({
  token: jwt.sign(
    {
      _id: user._id.toString(),
    },
    process.env.JWT_SECRET_KEY || '',
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_INT,
    },
  ),
  refresh_token: randToken.uid(256),
});

export const verify = (token: string): Partial<User> => {
  const verified = jwt.verify(token, process.env.JWT_SECRET_KEY || '');

  if (typeof verified === 'string') {
    return {
      _id: new ObjectId(verified),
    };
  }

  return {
    _id: new ObjectId(verified._id),
  };
};
