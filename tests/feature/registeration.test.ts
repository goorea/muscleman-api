import { UserFactory } from '@src/factories/UserFactory';
import { graphql } from '@tests/graphql';
import { UserLimit } from '@src/limits/UserLimit';
import { GraphQLError } from 'graphql';
import { UserModel } from '@src/models/User';
import { UserInputError } from 'apollo-server';
import { signIn } from '@tests/helpers';
import ForbiddenError from '@src/errors/ForbiddenError';
import ValidationError from '@src/errors/ValidationError';

describe('회원가입을 할 수 있다', () => {
  const registerMutation = `mutation register($input: UserInput!) { register(input: $input) { _id, password } }`;

  it('로그인한 사용자는 요청할 수 없다', async () => {
    const { token } = await signIn();

    const { errors } = await graphql(
      registerMutation,
      { input: UserFactory() },
      token,
    );

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    }
  });

  it('이름, 이메일, 닉네임, 비밀번호, 비밀번호 확인 필드는 반드시 필요하다', async () => {
    await Promise.all(
      ['name', 'email', 'nickname', 'password', 'password_confirmation'].map(
        async field => {
          const { errors } = await graphql(registerMutation, {
            input: UserFactory({ [field]: '' }),
          });

          expect(errors).not.toBeUndefined();
          if (errors) {
            expect(errors.length).toEqual(1);
            expect(errors[0].originalError).toBeInstanceOf(ValidationError);
          }
        },
      ),
    );
  });

  it(`이름은 ${UserLimit.name.minLength}글자 이상 ${UserLimit.name.maxLength}글자 이하이어야 한다`, async () => {
    await Promise.all(
      Object.entries(UserLimit.name).map(async ([key, value]) => {
        const { errors } = await graphql(registerMutation, {
          input: UserFactory({
            name: 'a'.repeat(value + (key === 'maxLength' ? 1 : -1)),
          }),
        });

        expect(errors).not.toBeUndefined();
        if (errors) {
          expect(errors[0].originalError).toBeInstanceOf(ValidationError);
        }
      }),
    );
  });

  it('이메일 형식이 아닌 이메일은 사용할 수 없다', async () => {
    const { errors } = await graphql(registerMutation, {
      input: UserFactory({ email: 'HelloWorld' }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('이미 등록된 이메일은 사용할 수 없다', async () => {
    const email = 'john@example.com';
    await UserModel.create(UserFactory({ email }));
    const { errors } = await graphql(registerMutation, {
      input: UserFactory({ email }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('E11000 duplicate key error dup key');
    }
  });

  it(`닉네임은 ${UserLimit.nickname.minLength}글자 이상 ${UserLimit.nickname.maxLength}글자 이하이어야 한다`, async () => {
    await Promise.all(
      Object.entries(UserLimit.nickname).map(async ([key, value]) => {
        const { errors } = await graphql(registerMutation, {
          input: UserFactory({
            nickname: 'a'.repeat(value + (key === 'maxLength' ? 1 : -1)),
          }),
        });

        expect(errors).not.toBeUndefined();
        if (errors) {
          expect(errors[0].originalError).toBeInstanceOf(ValidationError);
        }
      }),
    );
  });

  it('이미 등록된 닉네임은 사용할 수 없다', async () => {
    const nickname = '근육맨';
    await UserModel.create(UserFactory({ nickname }));
    const { errors } = await graphql(registerMutation, {
      input: UserFactory({ nickname }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('E11000 duplicate key error dup key');
    }
  });

  it(`비밀번호와 비밀번호 확인은 ${UserLimit.password.minLength}글자 이상이어야 한다`, async () => {
    await Promise.all(
      ['password', 'password_confirmation'].map(async field => {
        const { errors } = await graphql(registerMutation, {
          input: UserFactory({
            [field]: 'a'.repeat(UserLimit.password.minLength - 1),
          }),
        });

        expect(errors).not.toBeUndefined();
        if (errors) {
          expect(errors[0].originalError).toBeInstanceOf(ValidationError);
        }
      }),
    );
  });

  it('비밀번호와 비밀번호 확인 값은 같아야 한다', async () => {
    const { errors } = await graphql(registerMutation, {
      input: UserFactory({
        password: 'It is password',
        password_confirmation: 'It is password confirmation',
      }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors[0].originalError).toBeInstanceOf(UserInputError);
    }
  });

  it('성별 필드는 반드시 필요하다', async () => {
    const input = UserFactory({
      gender: undefined,
    });
    const { errors } = await graphql(registerMutation, {
      input,
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0]).toBeInstanceOf(GraphQLError);
    }
  });

  it('생년월일, 휴대폰번호, 프로필 이미지 경로는 빈 값을 허용한다', async () => {
    await Promise.all(
      ['birth', 'tel', 'profile_image_path'].map(async field => {
        const { errors } = await graphql(registerMutation, {
          input: UserFactory({ [field]: undefined }),
        });

        expect(errors).toBeUndefined();
      }),
    );
  });

  it(`생년월일은 ${UserLimit.birth.minDate.getFullYear()}년 이상 ${UserLimit.birth.maxDate.getFullYear()}년 이하이어야 한다`, async () => {
    await Promise.all(
      Object.entries(UserLimit.birth).map(async ([key, value]) => {
        const birth = new Date(value);
        birth.setDate(birth.getDate() + (key === 'maxDate' ? 1 : -1));

        const { errors } = await graphql(registerMutation, {
          input: UserFactory({
            birth: birth.toISOString(),
          }),
        });

        expect(errors).not.toBeUndefined();
        if (errors) {
          expect(errors[0].originalError).toBeInstanceOf(ValidationError);
        }
      }),
    );
  });

  it('휴대폰번호는 대한민국 휴대폰번호 형식이어야 한다', async () => {
    const { errors } = await graphql(registerMutation, {
      input: UserFactory({ tel: '1-206-123-4567' }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('프로필 이미지 경로는 URL 형식이어야 한다', async () => {
    const { errors } = await graphql(registerMutation, {
      input: UserFactory({ profile_image_path: '/foo/bar/baz.jpg' }),
    });

    expect(errors).not.toBeUndefined();
    if (errors) {
      expect(errors.length).toEqual(1);
      expect(errors[0].originalError).toBeInstanceOf(ValidationError);
    }
  });

  it('유효성 검사에 통과되면 사용자 입력 데이터를 데이터 베이스에 추가한다', async () => {
    const { data } = await graphql(registerMutation, {
      input: UserFactory(),
    });

    expect(await UserModel.exists({ _id: data?.register._id })).toBeTruthy();
  });

  // TODO: #21
  // it('사용자를 생성하고 이벤트를 실행한다', () => {});
});
