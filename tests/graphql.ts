import { ApolloClient, InMemoryCache } from '@apollo/client';
import { schema } from '@src/schema';
import { SchemaLink } from '@apollo/client/link/schema';
import { ApolloQueryResult } from '@apollo/client/core/types';
import {
  MutationOptions,
  QueryOptions,
} from '@apollo/client/core/watchQueryOptions';
import { FetchResult } from '@apollo/client/link/core';

const client = async (token?: string) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    ssrMode: true,
    link: new SchemaLink({ schema: await schema }),
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });

export const query = async <T, TVariables>(
  options: QueryOptions<TVariables, T>,
  token?: string,
): Promise<ApolloQueryResult<T>> =>
  (await client(token)).query<T, TVariables>(options);

export const mutate = async <TData, TVariables>(
  options: MutationOptions<TData, TVariables>,
  token?: string,
): Promise<FetchResult<TData>> =>
  (await client(token)).mutate<TData, TVariables>(options);
