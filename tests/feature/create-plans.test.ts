import { graphql } from '@tests/graphql';
import AuthenticationError from '@src/errors/AuthenticationError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { signIn } from '@tests/helpers';
import { ArgumentValidationError } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { TrainingModel } from '@src/models/Training';
import { PlanLimit } from '@src/limits/PlanLimit';

describe('운동 계획 생성', () => {
  const createPlanMutation = `mutation createPlan($input: PlanInput!) { createPlan(input: $input) { _id, user { _id, name }, training { _id, name }, plan_date, sets { count, weight } } }`;

  it('로그인 하지 않은 사용자는 요청할 수 없다', async () => {
    const { errors } = await graphql(createPlanMutation, {
      input: await PlanFactory(),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(AuthenticationError);
    }
  });

  it('로그인한 사용자는 운동 계획을 생성할 수 있다', async () => {
    const { token } = await signIn();
    const { data } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory(),
      },
      token,
    );

    expect(data?.createPlan).toHaveProperty('_id');
    expect(data?.createPlan).toHaveProperty(['user', '_id']);
    expect(data?.createPlan).toHaveProperty(['training', '_id']);
    expect(data?.createPlan).toHaveProperty('plan_date');
    expect(data?.createPlan).toHaveProperty('sets');
  });

  it('사용자 _id를 전달하면 해당 사용자를 저장한다', async () => {
    const { user, token } = await signIn();
    const { data } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory(),
      },
      token,
    );

    expect(user.name === data?.createPlan.user.name).toBeTruthy();
  });

  it('운동종목 필드는 반드시 필요하다', async () => {
    const { token } = await signIn();
    const { errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({ training: undefined }),
      },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0]).toBeInstanceOf(GraphQLError);
    }
  });

  it('운동종목 _id를 전달하면 해당 운동종목을 저장한다', async () => {
    const { token } = await signIn();
    const training = await TrainingModel.create(TrainingFactory());
    const { data, errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({ training: training._id.toHexString() }),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(training.name === data?.createPlan.training.name).toBeTruthy();
  });

  it('운동 날짜 필드는 반드시 필요하다', async () => {
    const { token } = await signIn();
    const { errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({ plan_date: '' }),
      },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
    }
  });

  it(`운동 날짜는 ${PlanLimit.plan_date.minDate.getFullYear()}년 이상 이하이어야 한다`, async () => {
    const { token } = await signIn();
    const plan_date = new Date(PlanLimit.plan_date.minDate);
    plan_date.setDate(plan_date.getDate() - 1);

    const { errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({
          plan_date: plan_date.toISOString(),
        }),
      },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
    }
  });

  it('세트는 빈 값을 허용한다', async () => {
    const { token } = await signIn();
    const { errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({ sets: undefined }),
      },
      token,
    );

    expect(errors).toBeUndefined();
  });

  it('세트의 횟수, 무게, 시간, 거리는 빈 값을 허용한다', async () => {
    const { token } = await signIn();

    await Promise.all(
      ['count', 'weight', 'times', 'distances'].map(async field => {
        const { errors } = await graphql(
          createPlanMutation,
          {
            input: await PlanFactory({ sets: [{ [field]: undefined }] }),
          },
          token,
        );

        expect(errors).toBeUndefined();
      }),
    );
  });

  it(`세트의 횟수는 ${PlanLimit.sets.count.min}개 이상, 무게는 ${PlanLimit.sets.weight.min}kg 이상, 시간은 ${PlanLimit.sets.times.min}초 이상, 거리는 ${PlanLimit.sets.distances.min}m 이상 이어야 한다`, async () => {
    const { token } = await signIn();

    await Promise.all(
      Object.entries(PlanLimit.sets).map(async ([key, { min }]) => {
        const { errors } = await graphql(
          createPlanMutation,
          {
            input: await PlanFactory({
              sets: [{ [key]: min - 1 }],
            }),
          },
          token,
        );

        expect(errors).not.toBeUndefined();
        if (errors) {
          expect(errors.length).toEqual(1);
          expect(errors[0].originalError).toBeInstanceOf(
            ArgumentValidationError,
          );
        }
      }),
    );
  });
});
