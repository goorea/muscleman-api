import { PlanFactory } from '@src/factories/PlanFactory';
import { PlanModel } from '@src/models/Plan';
import { Training } from '@src/models/Training';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('최대 무게 조회', () => {
  it('사용자의 운동 종목에 대한 최대 무게를 조회할 수 있다', async () => {
    const { user, token } = await signIn();
    const plan = await PlanModel.create({
      ...(await PlanFactory({
        sets: [{ weight: 100, count: 5 }],
      })),
      user: user._id.toHexString(),
    });
    const training = (await plan.populate<Training>({ path: 'training' }))
      .training as Training;

    const { data, errors } = await graphql(
      `
        query oneRM($type: String!) {
          oneRM(type: $type)
        }
      `,
      {
        type: training.type,
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.oneRM).toEqual(plan.one_rm);
  });
});
