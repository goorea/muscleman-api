import mongoose from 'mongoose';

describe('graphQL과 mongoDB를 연결한다', () => {
  it('mongo 메모리 서버가 실행 중이다', () => {
    expect(mongoose.connection.readyState).toEqual(1);
  });
});
