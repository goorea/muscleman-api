import { IncomingHttpHeaders, Server } from 'http';

import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { context } from '@src/context';
import { schema } from '@src/schema';

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
