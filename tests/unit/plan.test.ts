import { PlanFactory } from '@src/factories/PlanFactory';
import { Model } from '@src/models/Model';
import { Plan } from '@src/models/Plan';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('운동계획 모델', () => {
  it('Model을 상속받고 있다', () => {
    expect(Object.getPrototypeOf(Plan)).toEqual(Model);
  });

  it('운동 계획을 생성할 때 1rm을 저장하는 훅이 있다', async () => {
    const { token } = await signIn();
    const { data, errors } = await graphql(
      `
        mutation createPlan($input: CreatePlanInput!) {
          createPlan(input: $input) {
            oneRM
          }
        }
      `,
      {
        input: await PlanFactory({
          sets: [{ weight: 100, count: 5 }],
        }),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.createPlan?.oneRM !== 0).toBeTruthy();
  });
});
