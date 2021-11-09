import { SubscriptionServer } from 'subscriptions-transport-ws';
import { schema } from '@src/schema';
import { execute, subscribe } from 'graphql';
import { ApolloServer } from 'apollo-server-express';
import { context } from '@src/context';
import { IncomingHttpHeaders, Server } from 'http';
import express from 'express';

export const subscription = async (
  httpServer: Server,
  server: ApolloServer,
): Promise<SubscriptionServer> =>
  SubscriptionServer.create(
    {
      schema: await schema,
      execute,
      subscribe,
      async onConnect(headers: IncomingHttpHeaders) {
        return context({
          req: {
            headers: {
              ...headers,
              authorization: headers.Authorization,
            },
          } as express.Request,
          res: {} as express.Response,
        });
      },
    },
    { server: httpServer, path: server.graphqlPath },
  );
