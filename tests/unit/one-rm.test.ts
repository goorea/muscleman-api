import { Model } from '@src/models/Model';
import { OneRM } from '@src/models/OneRM';

describe('완료한 최대 1회 무게 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(OneRM)).toEqual(Model);
  });
});
