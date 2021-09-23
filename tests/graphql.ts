import { graphql as _graphql } from 'graphql';
import { ExecutionResult } from 'graphql/execution/execute';
import { Maybe } from 'graphql/jsutils/Maybe';
import { schema } from '@src/schema';
import { verify } from '@src/plugins/jwt';

export const graphql = async (
  source: string,
  variableValues?: Maybe<{ [key: string]: unknown }>,
  token?: string,
): Promise<ExecutionResult> =>
  _graphql({
    schema: await schema,
    source,
    variableValues,
    contextValue: {
      user: token ? verify(token) : undefined,
    },
  });
