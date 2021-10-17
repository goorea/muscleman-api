import jwt, {
  TokenExpiredError as JsonWebTokenTokenExpiredError,
} from 'jsonwebtoken';
import { User } from '@src/models/User';
import randToken from 'rand-token';
import { mongoose } from '@typegoose/typegoose';
import { LoginResponse } from '@src/resolvers/types/LoginResponse';
import TokenExpiredError from '@src/errors/TokenExpiredError';

export const sign = (user: User): LoginResponse => ({
  token: jwt.sign(
    {
      _id: user._id.toHexString(),
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
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY || '');

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
