import 'reflect-metadata';
import { connect } from 'mongoose';
import { ApolloServer } from 'apollo-server';
import { schema } from '@src/schema';
import { context } from '@src/context';

async function bootstrap() {
  try {
    await connect(process.env.DB_HOST || '', {
      dbName: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      pass: process.env.DB_PASSWORD,
    });

    const server = new ApolloServer({
      schema: await schema,
      context,
    });

    const { url } = await server.listen(process.env.APP_PORT || 4000);
    console.log(`서버 실행 중, GraphQL이 ${url} 에서 실행되고 있습니다`);
  } catch (err) {
    console.error(err);
  }
}

bootstrap();
