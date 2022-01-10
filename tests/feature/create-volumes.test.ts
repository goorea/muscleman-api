import ValidationError from '@src/errors/ValidationError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { VolumeLimit } from '@src/limits/VolumeLimit';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('운동 볼륨 생성', () => {
  const multipleCreateOrUpdatePlansMutation = `mutation multipleCreateOrUpdatePlans($inputs: [PlanInput!]!) { multipleCreateOrUpdatePlans(inputs: $inputs) { _id, user { _id, name }, plannedAt, training { _id, name }, volumes { complete, count, weight } } }`;

  it('완료 여부는 빈 값을 허용하고 default가 false이다', async () => {
    const { token } = await signIn();

    const { data, errors } = await graphql(
      multipleCreateOrUpdatePlansMutation,
      {
        inputs: [
          await PlanFactory({
            volumes: [VolumeFactory({ complete: undefined })],
          }),
        ],
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(
      data?.multipleCreateOrUpdatePlans[0].volumes[0].complete === false,
    ).toBeTruthy();
  });

  it('볼륨의 횟수, 무게, 시간, 거리는 빈 값을 허용한다', async () => {
    const { token } = await signIn();

    await Promise.all(
      ['count', 'weight', 'times', 'distances'].map(async field => {
        const { errors } = await graphql(
          multipleCreateOrUpdatePlansMutation,
          {
            inputs: [
              await PlanFactory({
                volumes: [VolumeFactory({ [field]: undefined })],
              }),
            ],
          },
          token,
        );

        expect(errors).toBeUndefined();
      }),
    );
  });

  it(`볼륨의 횟수는 ${VolumeLimit.count.min}개 이상, 무게는 ${VolumeLimit.weight.min}kg 이상, 시간은 ${VolumeLimit.times.min}초 이상, 거리는 ${VolumeLimit.distances.min}m 이상 이어야 한다`, async () => {
    const { token } = await signIn();

    await Promise.all(
      Object.entries(VolumeLimit).map(async ([key, { min }]) => {
        const { errors } = await graphql(
          multipleCreateOrUpdatePlansMutation,
          {
            inputs: [
              await PlanFactory({
                volumes: [VolumeFactory({ [key]: min - 1 })],
              }),
            ],
          },
          token,
        );

        expect(errors).toBeDefined();
        if (errors) {
          expect(errors.length).toEqual(1);
          expect(errors[0].originalError).toBeInstanceOf(ValidationError);
        }
      }),
    );
  });
});
