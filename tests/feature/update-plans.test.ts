import { DocumentType } from '@typegoose/typegoose';
import * as faker from 'faker';
import { GraphQLError } from 'graphql';

import AuthenticationError from '@src/errors/AuthenticationError';
import DocumentNotFoundError from '@src/errors/DocumentNotFoundError';
import ForbiddenError from '@src/errors/ForbiddenError';
import ValidationError from '@src/errors/ValidationError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { UserFactory } from '@src/factories/UserFactory';
import { Plan, PlanModel } from '@src/models/Plan';
import { User, UserModel } from '@src/models/User';
import { PlanQueryHelpers } from '@src/models/types/Plan';
import { UserQueryHelpers } from '@src/models/types/User';
import { UpdatePlanInput } from '@src/resolvers/types/UpdatePlanInput';
import { Role } from '@src/types/enums';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('운동 계획 수정', () => {
  const updatePlanMutation = `mutation updatePlan($_id: ObjectId!, $input: UpdatePlanInput!) { updatePlan(_id: $_id, input: $input) }`;

  it('로그인 하지 않은 사용자는 수정 요청할 수 없다', async () => {
    const plan = await getPlan();
    const { errors } = await graphql(updatePlanMutation, {
      _id: plan._id.toHexString(),
      input: await PlanFactory(),
    });

    expect(errors).toBeDefined();
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

    expect(errors).toBeDefined();
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
          plannedAt: updatePlanDate.toISOString(),
        }),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.updatePlan).toBeTruthy();
    expect(
      (
        await PlanModel.findById(plan._id)
          .orFail(new DocumentNotFoundError())
          .exec()
      ).plannedAt,
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
          plannedAt: updatePlanDate.toISOString(),
        }),
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.updatePlan).toBeTruthy();
    expect(
      (
        await PlanModel.findById(plan._id)
          .orFail(new DocumentNotFoundError())
          .exec()
      ).plannedAt,
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

    expect(errors).toBeDefined();
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
});

describe('운동 계획 삭제', () => {
  const deletePlanMutation = `mutation deletePlan($_id: ObjectId!) { deletePlan(_id: $_id) }`;

  it('로그인 하지 않은 사용자는 삭제 요청할 수 없다', async () => {
    const plan = await getPlan();
    const { errors } = await graphql(deletePlanMutation, {
      _id: plan._id.toHexString(),
    });

    expect(errors).toBeDefined();
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

    expect(errors).toBeDefined();
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
  input?: UpdatePlanInput,
  user?: DocumentType<User, UserQueryHelpers>,
): Promise<DocumentType<Plan, PlanQueryHelpers>> {
  return PlanModel.create({
    ...(await PlanFactory(input)),
    user: (user ?? (await UserModel.create(UserFactory())))._id.toHexString(),
  });
}

// 로그인 하지 않은 사용자는 삭제 요청할 수 없다
// 관리자가 아니거나 해당 계획을 추가한 사용자가 아니면 삭제 요청할 수 없다
