import { PlanFactory } from '@src/factories/PlanFactory';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { UserFactory } from '@src/factories/UserFactory';
import { Model } from '@src/models/Model';
import { Plan, PlanModel } from '@src/models/Plan';
import { Training, TrainingModel } from '@src/models/Training';
import { UserModel } from '@src/models/User';

describe('운동종목 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Training)).toEqual(Model);
  });

  it('운동종목을 삭제하면 해당 종목으로 추가된 모든 운동 계획들이 삭제된다', async () => {
    const count = 5;
    const training = await TrainingModel.create(TrainingFactory());
    await Promise.all(
      [...Array(count)].map(async () =>
        PlanModel.create({
          ...(await PlanFactory()),
          user: (await UserModel.create(UserFactory()))._id,
          training: training._id.toHexString(),
        } as Plan),
      ),
    );

    expect(await PlanModel.find().count().exec()).toEqual(count);

    await TrainingModel.findByIdAndDelete(training._id);

    expect(await PlanModel.find().count().exec()).toEqual(0);
  });
});
