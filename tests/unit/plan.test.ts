import { Model } from '@src/models/Model';
import { Plan } from '@src/models/Plan';

describe('운동계획 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Plan)).toEqual(Model);
  });
});
