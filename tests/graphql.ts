import { graphql as _graphql } from 'graphql';
import { ExecutionResult } from 'graphql/execution/execute';
import schema from '@src/graphql/schema';
import { Maybe } from 'graphql/jsutils/Maybe';

export const graphql = async (
  source: string,
  variables?: Maybe<{ [key: string]: any }>,
): Promise<ExecutionResult> => {
  return _graphql({
    schema,
    source,
    variableValues: variables,
  });
};
