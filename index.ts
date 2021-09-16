import app from './src/app';

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`${port}포트 서버 대기 중!`);
});
