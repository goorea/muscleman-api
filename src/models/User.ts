import { Field, Int, ObjectType } from 'type-graphql';
import { getModelForClass, pre, prop } from '@typegoose/typegoose';
import { Gender } from '@src/types/enums';
import { Model } from '@src/models/Model';
import bcrypt from 'bcrypt';

@pre<User>('save', async function () {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
})
@ObjectType({ implements: Model, description: '사용자 모델' })
export class User extends Model {
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

  @Field(() => Int, { description: '나이', nullable: true })
  @prop({ type: Number })
  age?: number;

  @Field(() => Gender, { description: '성별' })
  @prop({ enum: Gender, type: String })
  gender: Gender;

  @Field(() => Int, { description: '키', nullable: true })
  @prop({ type: Number })
  height?: number;

  @Field(() => Int, { description: '몸무게', nullable: true })
  @prop({ type: Number })
  weight?: number;

  @Field(() => Int, { description: '체지방량(kg)', nullable: true })
  @prop({ type: Number })
  fat?: number;

  @Field(() => Int, { description: '골격근량(kg)', nullable: true })
  @prop({ type: Number })
  muscle?: number;

  @Field(() => String, { description: '휴대폰번호', nullable: true })
  @prop({ type: String })
  tel?: string;

  @Field(() => String, { description: '프로필 이미지 경로', nullable: true })
  @prop({ type: String })
  profile_image_path?: string;

  @Field(() => String, { description: 'JWT Refresh 토큰', nullable: true })
  @prop({ type: String })
  refresh_token?: string;
}

export const UserModel = getModelForClass(User);
