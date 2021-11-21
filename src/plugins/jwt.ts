import { mongoose } from '@typegoose/typegoose';
import {
  TokenExpiredError as JsonWebTokenTokenExpiredError,
  sign as jwtSign,
  verify as jwtVerify,
} from 'jsonwebtoken';
import { uid } from 'rand-token';

import TokenExpiredError from '@src/errors/TokenExpiredError';
import { User } from '@src/models/User';
import { JWTResponse } from '@src/resolvers/types/JWTResponse';

export const sign = (user: User): JWTResponse => ({
  token: jwtSign(
    {
      _id: user._id.toHexString(),
    },
    process.env.JWT_SECRET_KEY || '',
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_INT,
    },
  ),
  refreshToken: uid(256),
});

export const verify = (token: string): Pick<User, '_id'> => {
  try {
    const verified = jwtVerify(token, process.env.JWT_SECRET_KEY || '');

    if (typeof verified === 'string') {
      return {
        _id: new mongoose.Types.ObjectId(verified),
      };
    }

    return {
      _id: new mongoose.Types.ObjectId(verified._id),
    };
  } catch (e) {
    if (e instanceof JsonWebTokenTokenExpiredError) {
      throw new TokenExpiredError(e.expiredAt);
    }

    throw e;
  }
};
