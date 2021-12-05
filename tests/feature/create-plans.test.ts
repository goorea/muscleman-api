import { GraphQLError } from 'graphql';

import AuthenticationError from '@src/errors/AuthenticationError';
import ValidationError from '@src/errors/ValidationError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { VolumeFactory } from '@src/factories/VolumeFactory';
import { PlanLimit } from '@src/limits/PlanLimit';
import { VolumeLimit } from '@src/limits/VolumeLimit';
import { TrainingModel } from '@src/models/Training';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

const createPlanMutation = `mutation createPlan($input: CreatePlanInput!) { createPlan(input: $input) { _id, user { _id, name }, plannedAt, training { _id, name }, complete, volumes { count, weight } } }`;

describe('운동 계획 생성', () => {
  it('로그인 하지 않은 사용자는 요청할 수 없다', async () => {
    const { errors } = await graphql(createPlanMutation, {
      input: await PlanFactory(),
    });

    expect(errors).toBeDefined();
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
    expect(data?.createPlan).toHaveProperty('plannedAt');
    expect(data?.createPlan).toHaveProperty('volumes');
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

  it('운동 날짜 필드는 반드시 필요하다', async () => {
    const { token } = await signIn();
    const { errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({ plannedAt: '' }),
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it(`운동 날짜는 ${PlanLimit.plannedAt.minDate.getFullYear()}년 이상 이하이어야 한다`, async () => {
    const { token } = await signIn();
    const plannedAt = new Date(PlanLimit.plannedAt.minDate);
    plannedAt.setDate(plannedAt.getDate() - 1);

    const { errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({
          plannedAt: plannedAt.toISOString(),
        }),
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });
});

describe('운동 볼륨 생성', () => {
  it('운동종목 필드는 반드시 필요하다', async () => {
    const { token } = await signIn();
    const { errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({ training: undefined }),
      },
      token,
    );

    expect(errors).toBeDefined();
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

  it('완료 여부는 빈 값을 허용하고 default가 false이다', async () => {
    const { token } = await signIn();

    const { data, errors } = await graphql(
      createPlanMutation,
      {
        input: await PlanFactory({ complete: undefined }),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.createPlan.complete === false).toBeTruthy();
  });

  it('볼륨의 횟수, 무게, 시간, 거리는 빈 값을 허용한다', async () => {
    const { token } = await signIn();

    await Promise.all(
      ['count', 'weight', 'times', 'distances'].map(async field => {
        const { errors } = await graphql(
          createPlanMutation,
          {
            input: await PlanFactory({
              volumes: [VolumeFactory({ [field]: undefined })],
            }),
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
          createPlanMutation,
          {
            input: await PlanFactory({
              volumes: [VolumeFactory({ [key]: min - 1 })],
            }),
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
