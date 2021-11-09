import { signIn } from '@tests/helpers';
import { PlanModel } from '@src/models/Plan';
import { PlanFactory } from '@src/factories/PlanFactory';
import { graphql } from '@tests/graphql';
import { Training } from '@src/models/Training';

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

  it('사용자의 운동 종목에 대한 최대 무게를 구독할 수 있다', async () => {
    const { user, token } = await signIn();
    const plan = await PlanModel.create({
      ...(await PlanFactory({
        sets: [{ weight: 100, count: 5 }],
        complete: false,
      })),
      user: user._id.toHexString(),
    });
    const training = (await plan.populate<Training>({ path: 'training' }))
      .training as Training;
    const { data, errors } = await graphql(
      `
        subscription subscribeOneRM($topic: String!) {
          subscribeOneRM(topic: $topic)
        }
      `,
      {
        topic: training.type,
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.subscribeOneRM).toEqual(0);
  });
});
