import { GraphQLError } from 'graphql';

import AuthenticationError from '@src/errors/AuthenticationError';
import ForbiddenError from '@src/errors/ForbiddenError';
import ValidationError from '@src/errors/ValidationError';
import { TrainingFactory } from '@src/factories/TrainingFactory';
import { TrainingLimit } from '@src/limits/TrainingLimit';
import { TrainingModel } from '@src/models/Training';
import { Role } from '@src/types/enums';
import { graphql } from '@tests/graphql';
import { signIn } from '@tests/helpers';

describe('운동종목 추가', () => {
  const multipleCreateTrainingsMutation = `mutation multipleCreateTrainings($inputs: [CreateTrainingInput!]!) { multipleCreateTrainings(inputs: $inputs) { _id } }`;

  it('로그인 하지 않으면 추가할 수 없다', async () => {
    const { errors } = await graphql(multipleCreateTrainingsMutation, {
      inputs: [TrainingFactory()],
    });

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(AuthenticationError);
    }
  });

  it('관리자 권한이 없으면 추가할 수 없다', async () => {
    const { token } = await signIn();
    const { errors } = await graphql(
      multipleCreateTrainingsMutation,
      {
        inputs: [TrainingFactory()],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('관리자는 추가할 수 있다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);
    const { data, errors } = await graphql(
      multipleCreateTrainingsMutation,
      {
        inputs: [TrainingFactory()],
      },
      token,
    );

    expect(errors).toBeUndefined();
    expect(data?.multipleCreateTrainings).toHaveLength(1);
  });

  it('이름 필드는 반드시 필요하다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);
    const { errors } = await graphql(
      multipleCreateTrainingsMutation,
      {
        inputs: [TrainingFactory({ name: '' })],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('이미 등록된 이름을 사용할 수 없다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);
    const name = '바벨 백스쿼트';
    await TrainingModel.create(TrainingFactory({ name }));
    const { errors } = await graphql(
      multipleCreateTrainingsMutation,
      {
        inputs: [TrainingFactory({ name })],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('E11000 duplicate key error dup key');
    }
  });

  it('분류 필드는 반드시 필요하다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);
    const { errors } = await graphql(
      multipleCreateTrainingsMutation,
      {
        inputs: [
          TrainingFactory({
            category: undefined,
          }),
        ],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0]).toBeInstanceOf(GraphQLError);
    }
  });

  it('종류 필드는 반드시 필요하다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);
    const { errors } = await graphql(
      multipleCreateTrainingsMutation,
      {
        inputs: [
          TrainingFactory({
            type: undefined,
          }),
        ],
      },
      token,
    );

    expect(errors).toBeDefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0]).toBeInstanceOf(GraphQLError);
    }
  });

  it('설명, 선호도, 썸네일경로, 영상경로는 빈값을 허용한다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);

    await Promise.all(
      ['description', 'preference', 'thumbnailPath', 'videoPath'].map(
        async field => {
          const { errors } = await graphql(
            multipleCreateTrainingsMutation,
            {
              inputs: [TrainingFactory({ [field]: undefined })],
            },
            token,
          );

          expect(errors).toBeUndefined();
        },
      ),
    );
  });

  it(`선호도는 ${TrainingLimit.preference.min}이상 ${TrainingLimit.preference.max}이하 이어야 한다`, async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);

    await Promise.all(
      Object.entries(TrainingLimit.preference).map(async ([key, value]) => {
        const { errors } = await graphql(
          multipleCreateTrainingsMutation,
          {
            inputs: [
              TrainingFactory({
                preference: value + (key === 'max' ? 1 : -1),
              }),
            ],
          },
          token,
        );

        expect(errors).toBeDefined();
        if (errors) {
          expect(errors[0].originalError).toBeInstanceOf(ValidationError);
        }
      }),
    );
  });

  it('썸네일경로와 영상경로는 URL 형식이어야 한다', async () => {
    const { token } = await signIn(undefined, [Role.ADMIN]);

    await Promise.all(
      ['thumbnailPath', 'videoPath'].map(async field => {
        const { errors } = await graphql(
          multipleCreateTrainingsMutation,
          {
            inputs: [TrainingFactory({ [field]: '/foo/bar/baz.jpg' })],
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
