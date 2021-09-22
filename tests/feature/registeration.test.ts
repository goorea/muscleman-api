import { UserFactory } from '@src/factories/UserFactory';
import { mutate, query } from '@tests/graphql';
import { UserLimit } from '@src/limits/UserLimit';
import { GraphQLError } from 'graphql';
import { User, UserModel } from '@src/models/User';
import { ArgumentValidationError, ForbiddenError } from 'type-graphql';
import { UserInputError } from 'apollo-server';
import bcrypt from 'bcrypt';
import { gql } from 'apollo-server';
import { UserInput } from '@src/resolvers/types/UserInput';
import { signIn } from '@tests/helpers';

describe('회원가입을 할 수 있다', () => {
  const registerMutation = (input: UserInput) => ({
    mutation: gql(
      `
      mutation register($input: UserInput!) {
        register(input: $input) {
          _id
          password
        }
      }
    `,
    ),
    variables: { input },
  });

  it('로그인한 사용자는 요청할 수 없다', async () => {
    const { token } = await signIn();

    const { errors } = await mutate<User, { input: UserInput }>(
      registerMutation(UserFactory()),
      token,
    );
    console.log(errors);
    // expect(errors).not.toBeUndefined();
    // if (errors) {
    //   expect(errors.length).toEqual(1);
    //   expect(errors[0].originalError).toBeInstanceOf(ForbiddenError);
    // }
  });

  // it('이름, 이메일, 닉네임, 비밀번호, 비밀번호 확인 필드는 반드시 필요하다', async () => {
  //   await Promise.all(
  //     ['name', 'email', 'nickname', 'password', 'password_confirmation'].map(
  //       async field => {
  //         const { errors } = await query<User, { input: UserInput }>(
  //           gql(registerMutation, {
  //             input: UserFactory({ [field]: '' }),
  //           }),
  //         );
  //
  //         expect(errors).not.toBeUndefined();
  //         if (errors) {
  //           expect(errors.length).toEqual(1);
  //           expect(errors[0].originalError).toBeInstanceOf(
  //             ArgumentValidationError,
  //           );
  //         }
  //       },
  //     ),
  //   );
  // });
  //
  // it(`이름은 ${UserLimit.name.minLength}글자 이상 ${UserLimit.name.maxLength}글자 이하이어야 한다`, async () => {
  //   await Promise.all(
  //     Object.entries(UserLimit.name).map(async ([key, value]) => {
  //       const { errors } = await query(registerMutation, {
  //         input: UserFactory({
  //           name: 'a'.repeat(value + (key === 'maxLength' ? 1 : -1)),
  //         }),
  //       });
  //
  //       expect(errors).not.toBeUndefined();
  //       if (errors) {
  //         expect(errors[0].originalError).toBeInstanceOf(
  //           ArgumentValidationError,
  //         );
  //       }
  //     }),
  //   );
  // });
  //
  // it('이메일 형식이 아닌 이메일은 사용할 수 없다', async () => {
  //   const { errors } = await query(registerMutation, {
  //     input: UserFactory({ email: 'HelloWorld' }),
  //   });
  //
  //   expect(errors).not.toBeUndefined();
  //   if (errors) {
  //     expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
  //   }
  // });
  //
  // it('이미 등록된 이메일은 사용할 수 없다', async () => {
  //   const email = 'john@example.com';
  //   await UserModel.create(UserFactory({ email }));
  //   const { errors } = await query(registerMutation, {
  //     input: UserFactory({ email }),
  //   });
  //
  //   expect(errors).not.toBeUndefined();
  //   if (errors) {
  //     expect(errors.length).toEqual(1);
  //     expect(errors[0].message).toContain('E11000 duplicate key error dup key');
  //   }
  // });
  //
  // it(`닉네임은 ${UserLimit.nickname.minLength}글자 이상 ${UserLimit.nickname.maxLength}글자 이하이어야 한다`, async () => {
  //   await Promise.all(
  //     Object.entries(UserLimit.nickname).map(async ([key, value]) => {
  //       const { errors } = await query(registerMutation, {
  //         input: UserFactory({
  //           nickname: 'a'.repeat(value + (key === 'maxLength' ? 1 : -1)),
  //         }),
  //       });
  //
  //       expect(errors).not.toBeUndefined();
  //       if (errors) {
  //         expect(errors[0].originalError).toBeInstanceOf(
  //           ArgumentValidationError,
  //         );
  //       }
  //     }),
  //   );
  // });
  //
  // it('이미 등록된 닉네임은 사용할 수 없다', async () => {
  //   const nickname = '근육맨';
  //   await UserModel.create(UserFactory({ nickname }));
  //   const { errors } = await query(registerMutation, {
  //     input: UserFactory({ nickname }),
  //   });
  //
  //   expect(errors).not.toBeUndefined();
  //   if (errors) {
  //     expect(errors.length).toEqual(1);
  //     expect(errors[0].message).toContain('E11000 duplicate key error dup key');
  //   }
  // });
  //
  // it(`비밀번호와 비밀번호 확인은 ${UserLimit.password.minLength}글자 이상이어야 한다`, async () => {
  //   await Promise.all(
  //     ['password', 'password_confirmation'].map(async field => {
  //       const { errors } = await query(registerMutation, {
  //         input: UserFactory({
  //           [field]: 'a'.repeat(UserLimit.password.minLength - 1),
  //         }),
  //       });
  //
  //       expect(errors).not.toBeUndefined();
  //       if (errors) {
  //         expect(errors[0].originalError).toBeInstanceOf(
  //           ArgumentValidationError,
  //         );
  //       }
  //     }),
  //   );
  // });
  //
  // it('비밀번호와 비밀번호 확인 값은 같아야 한다', async () => {
  //   const { errors } = await query(registerMutation, {
  //     input: UserFactory({
  //       password: 'It is password',
  //       password_confirmation: 'It is password confirmation',
  //     }),
  //   });
  //
  //   expect(errors).not.toBeUndefined();
  //   if (errors) {
  //     expect(errors[0].originalError).toBeInstanceOf(UserInputError);
  //   }
  // });
  //
  // it('성별 필드는 반드시 필요하다', async () => {
  //   const input = UserFactory({
  //     gender: undefined,
  //   });
  //   const { errors } = await query(registerMutation, {
  //     input,
  //   });
  //
  //   expect(errors).not.toBeUndefined();
  //   if (errors) {
  //     expect(errors.length).toEqual(1);
  //     expect(errors[0]).toBeInstanceOf(GraphQLError);
  //   }
  // });
  //
  // it('나이, 키, 몸무게, 체지방량, 골격근량, 휴대폰번호, 프로필 이미지 경로는 빈 값을 허용한다', async () => {
  //   const nullableFields = [
  //     'age',
  //     'height',
  //     'weight',
  //     'fat',
  //     'muscle',
  //     'tel',
  //     'profile_image_path',
  //   ];
  //
  //   await Promise.all(
  //     nullableFields.map(async field => {
  //       const { errors } = await query(registerMutation, {
  //         input: UserFactory({ [field]: undefined }),
  //       });
  //
  //       expect(errors).toBeUndefined();
  //     }),
  //   );
  // });
  //
  // it(`나이는 ${UserLimit.age.min}살 이상 ${UserLimit.age.max}살 이어야 한다`, async () => {
  //   await Promise.all(
  //     Object.entries(UserLimit.age).map(async ([key, value]) => {
  //       const { errors } = await query(registerMutation, {
  //         input: UserFactory({
  //           age: value + (key === 'max' ? 1 : -1),
  //         }),
  //       });
  //
  //       expect(errors).not.toBeUndefined();
  //       if (errors) {
  //         expect(errors[0].originalError).toBeInstanceOf(
  //           ArgumentValidationError,
  //         );
  //       }
  //     }),
  //   );
  // });
  //
  // it(`키는 ${UserLimit.height.min}이상 ${UserLimit.height.max}이하 이어야 한다`, async () => {
  //   await Promise.all(
  //     Object.entries(UserLimit.height).map(async ([key, value]) => {
  //       const { errors } = await query(registerMutation, {
  //         input: UserFactory({
  //           height: value + (key === 'max' ? 1 : -1),
  //         }),
  //       });
  //
  //       expect(errors).not.toBeUndefined();
  //       if (errors) {
  //         expect(errors[0].originalError).toBeInstanceOf(
  //           ArgumentValidationError,
  //         );
  //       }
  //     }),
  //   );
  // });
  //
  // it(`몸무게는 ${UserLimit.weight.min}이상 ${UserLimit.weight.max}이하 이어야 한다`, async () => {
  //   await Promise.all(
  //     Object.entries(UserLimit.weight).map(async ([key, value]) => {
  //       const { errors } = await query(registerMutation, {
  //         input: UserFactory({
  //           weight: value + (key === 'max' ? 1 : -1),
  //         }),
  //       });
  //
  //       expect(errors).not.toBeUndefined();
  //       if (errors) {
  //         expect(errors[0].originalError).toBeInstanceOf(
  //           ArgumentValidationError,
  //         );
  //       }
  //     }),
  //   );
  // });
  //
  // it('휴대폰번호는 대한민국 휴대폰번호 형식이어야 한다', async () => {
  //   const { errors } = await query(registerMutation, {
  //     input: UserFactory({ tel: '1-206-123-4567' }),
  //   });
  //
  //   expect(errors).not.toBeUndefined();
  //   if (errors) {
  //     expect(errors.length).toEqual(1);
  //     expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
  //   }
  // });
  //
  // it('프로필 이미지 경로는 URL 형식이어야 한다', async () => {
  //   const { errors } = await query(registerMutation, {
  //     input: UserFactory({ profile_image_path: '/foo/bar/baz.jpg' }),
  //   });
  //
  //   expect(errors).not.toBeUndefined();
  //   if (errors) {
  //     expect(errors.length).toEqual(1);
  //     expect(errors[0].originalError).toBeInstanceOf(ArgumentValidationError);
  //   }
  // });
  //
  // it('데이터 베이스에 사용자 정보를 저장하기 전에 비밀번호를 해쉬화 한다', async () => {
  //   const input = UserFactory();
  //   const { data } = await query(registerMutation, {
  //     input,
  //   });
  //
  //   expect(
  //     await bcrypt.compare(input.password, data?.register.password),
  //   ).toBeTruthy();
  // });
  //
  // it('유효성 검사에 통과되면 사용자 입력 데이터를 데이터 베이스에 추가한다', async () => {
  //   const { data } = await query(registerMutation, {
  //     input: UserFactory(),
  //   });
  //
  //   expect(await UserModel.exists({ _id: data?.register._id })).toBeTruthy();
  // });

  // TODO: #21
  // it('사용자를 생성하고 이벤트를 실행한다', () => {});
});