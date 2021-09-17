import { Schema, model } from 'mongoose';

export interface UserContract {
  name: string;
  email: string;
}

const scheme = new Schema<UserContract>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
const User = model<UserContract>('user', scheme);

export default User;
