import { DocumentType } from '@typegoose/typegoose';

import AuthenticationError from '@src/errors/AuthenticationError';
import ForbiddenError from '@src/errors/ForbiddenError';
import { PlanFactory } from '@src/factories/PlanFactory';
import { UserFactory } from '@src/factories/UserFactory';
import { Plan, PlanModel } from '@src/models/Plan';
import { User, UserModel } from '@src/models/User';
import { PlanQueryHelpers } from '@src/models/types/Plan';
import { UserQueryHelpers } from '@src/models/types/User';
import { PlanInput } from '@src/resolvers/types/PlanInput';
import { Role } from '@src/types/enums';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

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
  input?: PlanInput,
  user?: DocumentType<User, UserQueryHelpers>,
): Promise<DocumentType<Plan, PlanQueryHelpers>> {
  return PlanModel.createWithVolumes(
    user ?? (await UserModel.create(UserFactory())),
    await PlanFactory(input),
  );
}
