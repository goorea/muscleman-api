import mongoose, { Mongoose } from 'mongoose';

export default class Connection {
  static make(): Promise<Mongoose> {
    mongoose.Promise = global.Promise;
    mongoose.set('toJSON', {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
      },
    });

    return mongoose.connect(process.env.DB_HOST || '', {
      dbName: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      pass: process.env.DB_PASSWORD,
    });
  }
}
