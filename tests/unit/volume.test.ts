import { PlanFactory } from '@src/factories/PlanFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { Model } from '@src/models/Model';
import { Volume } from '@src/models/Volume';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('운동볼륨 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Volume)).toEqual(Model);
  });

  it('중량 볼륨을 생성할 때 1rm과 총볼륨을 저장하는 훅이 있다', async () => {
    const { token } = await signIn();
    const { data, errors } = await graphql(
      `
        mutation createPlan($input: CreatePlanInput!) {
          createPlan(input: $input) {
            plannedAt
            volumes {
              weight
              count
              total
              oneRM
            }
          }
        }
      `,
      {
        input: await PlanFactory({
          volumes: [await VolumeFactory({ weight: 100, count: 5 })],
        }),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.createPlan.volumes[0].total !== 0).toBeTruthy();
    expect(data?.createPlan.volumes[0].oneRM !== 0).toBeTruthy();
  });
});
