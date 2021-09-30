import { graphql } from '@tests/graphql';
import { PlanFactory } from '@src/factories/PlanFactory';
import AuthenticationError from '@src/errors/AuthenticationError';
import { Plan, PlanModel } from '@src/models/Plan';
import { User, UserModel } from '@src/models/User';
import { UserFactory } from '@src/factories/UserFactory';
import { PlanInput } from '@src/resolvers/types/PlanInput';
import { EnforceDocument } from 'mongoose';
import { PlanMethods } from '@src/models/types/Plan';
import { signIn } from '@tests/helpers';
import { ArgumentValidationError, ForbiddenError } from 'type-graphql';
import { UserMethods } from '@src/models/types/User';
import { Role } from '@src/types/enums';
import { GraphQLError } from 'graphql';
import * as faker from 'faker';

describe('운동 계획 수정', () => {
  const updatePlanMutation = `mutation updatePlan($_id: ObjectId!, $input: PlanInput!) { updatePlan(_id: $_id, input: $input) }`;

  it('로그인 하지 않은 사용자는 수정 요청할 수 없다', async () => {
    const plan = await getPlan();
    const { errors } = await graphql(updatePlanMutation, {
      _id: plan._id.toHexString(),
      input: await PlanFactory(),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(AuthenticationError);
    }
  });

  it('해당 계획을 추가한 사용자가 아니면 수정 요청할 수 없다', async () => {
    const { token } = await signIn();
    const plan = await getPlan();
    const { errors } = await graphql(
      updatePlanMutation,
      {
        _id: plan._id.toHexString(),
        input: await PlanFactory(),
      },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('로그인을 하고 해당 계획을 추가한 사용자라면 수정할 수 있다', async () => {
    const { user, token } = await signIn();
    const plan = await getPlan(undefined, user);
    const updatePlanDate = faker.date.future();
    const { data, errors } = await graphql(
      updatePlanMutation,
      {
        _id: plan._id.toHexString(),
        input: await PlanFactory({
          plan_date: updatePlanDate.toISOString(),
        }),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.updatePlan).toBeTruthy();
    expect(
      (await PlanModel.findById(plan._id).orFail().exec()).plan_date,
    ).toEqual(updatePlanDate);
  });

  it('관리자는 어떤 계획이든 수정할 수 있다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);
    const plan = await getPlan();
    const updatePlanDate = faker.date.future();
    const { data, errors } = await graphql(
      updatePlanMutation,
      {
        _id: plan._id.toHexString(),
        input: await PlanFactory({
          plan_date: updatePlanDate.toISOString(),
        }),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.updatePlan).toBeTruthy();
    expect(
      (await PlanModel.findById(plan._id).orFail().exec()).plan_date,
    ).toEqual(updatePlanDate);
  });

  it('운동종목 필드는 반드시 필요하다', async () => {
    const { token } = await signIn();
    const plan = await getPlan();
    const { errors } = await graphql(
      updatePlanMutation,
      {
        _id: plan._id.toHexString(),
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

  it('운동 날짜 필드는 반드시 필요하다', async () => {
    const { token } = await signIn();
    const plan = await getPlan();
    const { errors } = await graphql(
      updatePlanMutation,
      {
        _id: plan._id.toHexString(),
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
});

describe('운동 계획 삭제', () => {
  const deletePlanMutation = `mutation deletePlan($_id: ObjectId!) { deletePlan(_id: $_id) }`;

  it('로그인 하지 않은 사용자는 삭제 요청할 수 없다', async () => {
    const plan = await getPlan();
    const { errors } = await graphql(deletePlanMutation, {
      _id: plan._id.toHexString(),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(AuthenticationError);
    }
  });

  it('해당 계획을 추가한 사용자가 아니면 삭제 요청할 수 없다', async () => {
    const { token } = await signIn();
    const plan = await getPlan();
    const { errors } = await graphql(
      deletePlanMutation,
      {
        _id: plan._id.toHexString(),
      },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('로그인을 하고 해당 계획을 추가한 사용자라면 삭제할 수 있다', async () => {
    const { user, token } = await signIn();
    const plan = await getPlan(undefined, user);
    const { data, errors } = await graphql(
      deletePlanMutation,
      {
        _id: plan._id.toHexString(),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.deletePlan).toBeTruthy();
    expect(await PlanModel.findById(plan._id).count()).toEqual(0);
  });

  it('관리자는 어떤 계획이든 삭제할 수 있다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);
    const plan = await getPlan();
    const { data, errors } = await graphql(
      deletePlanMutation,
      {
        _id: plan._id.toHexString(),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.deletePlan).toBeTruthy();
    expect(await PlanModel.findById(plan._id).count()).toEqual(0);
  });
});

async function getPlan(
  input?: Partial<PlanInput>,
  user?: EnforceDocument<User, UserMethods>,
): Promise<EnforceDocument<Plan, PlanMethods>> {
  return PlanModel.create({
    ...(await PlanFactory(input)),
    user: (user ?? (await UserModel.create(UserFactory())))._id.toHexString(),
  });
}

// 로그인 하지 않은 사용자는 삭제 요청할 수 없다
// 관리자가 아니거나 해당 계획을 추가한 사용자가 아니면 삭제 요청할 수 없다
