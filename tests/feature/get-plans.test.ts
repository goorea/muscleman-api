import { graphql } from '@tests/graphql';
import AuthenticationError from '@src/errors/AuthenticationError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { signIn } from '@tests/helpers';
import { Plan, PlanModel } from '@src/models/Plan';

describe('운동 계획 조회', () => {
  const plansQuery = `query plans { plans { _id } }`;

  it('로그인 하지 않은 사용자는 모든 운동 계획을 조회할 수 없다', async () => {
    const { errors } = await graphql(plansQuery);

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(AuthenticationError);
    }
  });

  it('로그인한 사용자는 자신의 모든 운동 계획들을 조회할 수 있다', async () => {
    const count = 5;
    const { user, token } = await signIn();
    await Promise.all(
      [...Array(count)].map(async () => {
        await PlanModel.create({
          ...(await PlanFactory()),
          user: user._id,
        } as Plan);
      }),
    );
    const { data, errors } = await graphql(plansQuery, undefined, token);

    expect(errors).toBeUndefined();
    expect(data?.plans.length).toEqual(count);
  });
});
