import AuthenticationError from '@src/errors/AuthenticationError';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { Plan, PlanModel } from '@src/models/Plan';
import { TrainingModel } from '@src/models/Training';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

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

  it('운동 계획이 완료 상태라면 사용자의 운동 종목에 대한 최대 무게를 조회할 수 있다', async () => {
    const { token } = await signIn();
    const createPlanResponse = await graphql(
      `
        mutation createPlan($input: CreatePlanInput!) {
          createPlan(input: $input) {
            _id
            oneRM
          }
        }
      `,
      {
        input: await PlanFactory({
          sets: [{ weight: 100, count: 5 }],
          complete: true,
        }),
      },
      token,
    );
    const plan = await PlanModel.findById(
      createPlanResponse.data?.createPlan._id,
    ).orFail(new DocumentNotFoundError());
    const training = await TrainingModel.findById(plan.training);

    const { data, errors } = await graphql(
      `
        query getOneRM($name: String!) {
          getOneRM(name: $name)
        }
      `,
      {
        name: training?.name,
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.getOneRM).toEqual(createPlanResponse.data?.createPlan.oneRM);
  });
});
