import { PlanFactory } from '@src/factories/PlanFactory';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { Model } from '@src/models/Model';
import { PlanModel } from '@src/models/Plan';
import { Training, TrainingModel } from '@src/models/Training';
import { VolumeModel } from '@src/models/Volume';
import { signIn } from '@tests/helpers';

describe('운동종목 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Training)).toEqual(Model);
  });

  it('운동종목을 삭제하면 해당 종목으로 추가된 모든 운동 볼륨들이 삭제된다', async () => {
    const count = 5;
    const { user } = await signIn();
    const training = await TrainingModel.create(TrainingFactory());
    await Promise.all(
      [...Array(count)].map(async () =>
        PlanModel.createWithVolumes(
          user,
          await PlanFactory({
            volumes: [
              await VolumeFactory({ training: training._id.toHexString() }),
            ],
          }),
        ),
      ),
    );

    expect(await VolumeModel.find().count().exec()).toEqual(count);

    await TrainingModel.findByIdAndDelete(training._id);

    expect(await VolumeModel.find().count().exec()).toEqual(0);
  });
});
