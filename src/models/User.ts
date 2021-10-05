import { Field, ObjectType } from 'type-graphql';
import {
  DocumentType,
  getModelForClass,
  pre,
  prop,
} from '@typegoose/typegoose';
import { Gender, Role, SocialProvider } from '@src/types/enums';
import { Model } from '@src/models/Model';
import { LoginResponse } from '@src/resolvers/types/LoginResponse';
import { sign } from '@src/plugins/jwt';
import { UserMethods, UserQueryHelpers } from '@src/models/types/User';
import {
  deleteLinkedReferences,
  hashPassword,
} from '@src/models/hooks/user-hooks';

@pre<User>('save', hashPassword)
@pre<User>(
  ['deleteOne', 'deleteMany', 'findOneAndDelete'],
  deleteLinkedReferences,
)
@ObjectType({ implements: Model, description: '사용자 모델' })
export class User extends Model implements UserMethods {
  @Field(() => String, { description: '이름' })
  @prop({ type: String, required: true })
  name: string;

  @Field(() => String, { description: '이메일' })
  @prop({ type: String, required: true, unique: true })
  email: string;

  @Field(() => String, { description: '닉네임' })
  @prop({ type: String, required: true, unique: true })
  nickname: string;

  @Field(() => String, { description: '비밀번호', nullable: true })
  @prop({ type: String })
  password?: string;

  @Field(() => Gender, { description: '성별', nullable: true })
  @prop({ enum: Gender, type: String, addNullToEnum: true })
  gender?: Gender;

  @Field(() => Date, { description: '생년월일', nullable: true })
  @prop({ type: Date })
  birth?: string;

  @Field(() => String, { description: '휴대폰번호', nullable: true })
  @prop({ type: String })
  tel?: string;

  @Field(() => String, { description: '프로필 이미지 경로', nullable: true })
  @prop({ type: String })
  profile_image_path?: string;

  @Field(() => String, { description: 'JWT Refresh 토큰', nullable: true })
  @prop({ type: String })
  refresh_token?: string;

  @Field(() => String, { description: '이메일 인증 토큰', nullable: true })
  @prop({ type: String })
  email_verify_token?: string;

  @Field(() => [Role], { description: '권한', defaultValue: [] })
  @prop({
    type: [String],
    enum: Role,
    default: [],
  })
  roles: Role[];

  @Field(() => SocialProvider, {
    description: '소셜 로그인 유형',
    nullable: true,
  })
  @prop({ type: String, enum: SocialProvider })
  provider?: SocialProvider;

  async getJWTToken(
    this: DocumentType<User, UserQueryHelpers>,
  ): Promise<LoginResponse> {
    const jwt = sign(this);
    await this.updateOne({ refresh_token: jwt.refresh_token }).exec();

    return jwt;
  }
}

export const UserModel = getModelForClass<typeof User, UserQueryHelpers>(User);
