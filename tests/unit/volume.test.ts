import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { Model } from '@src/models/Model';
import { PlanModel } from '@src/models/Plan';
import { Volume, VolumeModel } from '@src/models/Volume';
import { signIn } from '@tests/helpers';

describe('운동볼륨 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Volume)).toEqual(Model);
  });

  it('중량 볼륨을 생성할 때 총볼륨과 1rm을 저장하는 훅이 있다', async () => {
    const { user } = await signIn();
    const plan = await PlanModel.createWithVolumes(
      user,
      await PlanFactory({
        volumes: [VolumeFactory({ weight: 100, count: 5, complete: true })],
      }),
    );

    const volume = await VolumeModel.findById(plan.volumes[0]?._id)
      .orFail(new DocumentNotFoundError())
      .exec();

    expect(volume.total !== 0).toBeTruthy();
    expect(volume.oneRM !== 0).toBeTruthy();
  });
});
