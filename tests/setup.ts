import faker from 'faker';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

faker.setLocale('ko');
let mongoMemoryServer: MongoMemoryServer;

beforeAll(async () => {
  mongoMemoryServer = await MongoMemoryServer.create();
  mongoose.Promise = Promise;
  await mongoose.connect(mongoMemoryServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoMemoryServer.stop();
});

afterEach(() => {
  jest.useRealTimers();
});
