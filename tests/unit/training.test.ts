import { Training } from '@src/models/Training';
import { Model } from '@src/models/Model';

describe('운동종목 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Training)).toEqual(Model);
  });
});
