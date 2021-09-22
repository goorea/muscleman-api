import { User } from '@src/models/User';
import { Model } from '@src/models/Model';

describe('사용자 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(User)).toEqual(Model);
  });
});
