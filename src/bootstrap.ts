import { connect } from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { schema } from '@src/schema';
import { context } from '@src/context';
import express from 'express';
import { createServer } from 'http';
import { subscription } from '@src/subscription';

async function bootstrap() {
  try {
    await connect(process.env.DB_HOST || '', {
      dbName: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      pass: process.env.DB_PASSWORD,
    });

    const app = express();
    const httpServer = createServer(app);

    const server = new ApolloServer({
      schema: await schema,
      context,
      plugins: [
        {
          async serverWillStart() {
            return {
              async drainServer() {
                subscriptionServer.close();
              },
            };
          },
        },
      ],
    });

    const subscriptionServer = await subscription(httpServer, server);

    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.APP_PORT || 4000;
    httpServer.listen(PORT, () =>
      console.log(`Server is now running on http://localhost:${PORT}/graphql`),
    );
  } catch (err) {
    console.error(err);
  }
}

bootstrap();
