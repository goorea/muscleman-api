import { graphql as _graphql } from 'graphql';
import { ExecutionResult } from 'graphql/execution/execute';
import { Maybe } from 'graphql/jsutils/Maybe';
import { schema } from '@src/schema';

export const graphql = async (
  source: string,
  variableValues?: Maybe<{ [key: string]: unknown }>,
): Promise<ExecutionResult> =>
  _graphql({
    schema: await schema,
    source,
    variableValues,
  });
