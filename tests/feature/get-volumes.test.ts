import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { PlanModel } from '@src/models/Plan';
import { TrainingModel } from '@src/models/Training';
import { VolumeModel } from '@src/models/Volume';
import { TrainingCategory, TrainingType } from '@src/types/enums';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('운동 볼륨 조회', () => {
  const getOneRMQuery = `query getOneRM($name: String!) { getOneRM(name: $name) }`;

  it('운동 볼륨이 완료 상태고 중량 볼륨이라면 사용자의 운동 종목에 대한 최대 무게를 조회할 수 있다', async () => {
    const { token, user } = await signIn();
    const training = await TrainingModel.create(TrainingFactory());
    const [firstPlan] = await PlanModel.multipleCreateOrUpdateWithVolumes(
      user,
      [
        await PlanFactory({
          training: training._id.toHexString(),
          volumes: [VolumeFactory({ count: 5, weight: 100, complete: true })],
        }),
      ],
    );

    const firstResponse = await graphql(
      getOneRMQuery,
      {
        name: training.name,
      },
      token,
    );

    expect(firstResponse.errors).toBeUndefined();
    expect(firstResponse.data?.getOneRM).toEqual(
      (
        await VolumeModel.findById(firstPlan.volumes[0])
          .orFail(new DocumentNotFoundError())
          .exec()
      ).oneRM,
    );

    const [secondPlan] = await PlanModel.multipleCreateOrUpdateWithVolumes(
      user,
      [
        await PlanFactory({
          training: training._id.toHexString(),
          volumes: [VolumeFactory({ count: 5, weight: 200, complete: true })],
        }),
      ],
    );

    const secondResponse = await graphql(
      getOneRMQuery,
      {
        name: training.name,
      },
      token,
    );

    expect(secondResponse.errors).toBeUndefined();
    expect(secondResponse.data?.getOneRM).toEqual(
      (
        await VolumeModel.findById(secondPlan.volumes[0])
          .orFail(new DocumentNotFoundError())
          .exec()
      ).oneRM,
    );
  });

  it('중량 볼륨이고 운동을 완료하지 않았다면 최대 무게를 0으로 반환한다', async () => {
    const { token, user } = await signIn();
    const squatName = '바벨 백스쿼트';
    const benchPressName = '벤치 프레스';
    const squat = await TrainingModel.create(
      TrainingFactory({
        name: squatName,
        category: TrainingCategory.WEIGHT,
        type: TrainingType.LOWER,
      }),
    );
    const benchPress = await TrainingModel.create(
      TrainingFactory({
        name: benchPressName,
        category: TrainingCategory.WEIGHT,
        type: TrainingType.CHEST,
      }),
    );
    await PlanModel.createWithVolumes(
      user,
      await PlanFactory({
        training: squat._id.toHexString(),
        volumes: [VolumeFactory({ weight: 100, count: 5, complete: true })],
      }),
    );
    await PlanModel.createWithVolumes(
      user,
      await PlanFactory({
        training: benchPress._id.toHexString(),
        volumes: [VolumeFactory({ weight: 100, count: 5, complete: false })],
      }),
    );

    const { data, errors } = await graphql(
      `
        query SBGetOneRM {
          squatGetOneRM: getOneRM(name: "${squatName}")
          benchpressGetOneRM: getOneRM(name: "${benchPressName}")
        }
      `,
      undefined,
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.squatGetOneRM === 0).toBeFalsy();
    expect(data?.benchpressGetOneRM === 0).toBeTruthy();
  });
});
