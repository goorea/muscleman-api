import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from '@src/graphql/schema';
import Connection from '@src/graphql/Connection';

Promise.all([Connection.make()]).then(() => {
  const port = process.env.PORT || 3000;

  express()
    .use(
      `/graphql`,
      graphqlHTTP({
        schema,
        graphiql: true,
      }),
    )
    .listen(port, () => {
      console.log(`${port}포트 서버 대기 중!`);
    });
});
