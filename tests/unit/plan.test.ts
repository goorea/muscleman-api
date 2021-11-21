import { PlanFactory } from '@src/factories/PlanFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { Model } from '@src/models/Model';
import { Plan, PlanModel } from '@src/models/Plan';
import { VolumeModel } from '@src/models/Volume';
import { signIn } from '@tests/helpers';

describe('운동계획 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Plan)).toEqual(Model);
  });

  it('운동계획을 삭제하면 해당 볼륨으로 추가된 모든 볼륨들이 삭제된다', async () => {
    const { user } = await signIn();
    const count = 5;
    const plan = await PlanModel.createWithVolumes(
      user,
      await PlanFactory({
        volumes: await Promise.all(
          [...Array(count)].map(() => VolumeFactory()),
        ),
      }),
    );

    expect(await VolumeModel.count()).toEqual(count);

    await PlanModel.findByIdAndDelete(plan._id);

    expect(await VolumeModel.count()).toEqual(0);
  });
});
