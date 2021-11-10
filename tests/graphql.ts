import { Request, Response } from 'express';
import { graphql as _graphql } from 'graphql';
import { ExecutionResult } from 'graphql/execution/execute';
import { Maybe } from 'graphql/jsutils/Maybe';

import { context } from '@src/context';
import { schema } from '@src/schema';

export const graphql = async (
  source: string,
  variableValues?: Maybe<{ [key: string]: unknown }>,
  token?: string,
): Promise<ExecutionResult> =>
  _graphql({
    schema: await schema,
    source,
    variableValues,
    contextValue: await context({
      req: {
        headers: { authorization: token ? `Bearer ${token}` : undefined },
      } as Request,
      res: {} as Response,
    }),
  });
