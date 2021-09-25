import 'reflect-metadata';
import { registerEnumType } from 'type-graphql';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}
registerEnumType(Gender, { name: 'Gender', description: '성별' });

export enum TrainingType {
  LOWER = 'LOWER', // 하체
  CHEST = 'CHEST', // 가슴
  BACK = 'BACK', // 등
  SHOULDER = 'SHOULDER', // 어꺠
  ARM = 'ARM', // 팔
  ABDOMINAL = 'ABDOMINAL', // 복근
  CARDIOVASCULAR = 'CARDIOVASCULAR', // 유산소
  ETC = 'ETC', // 기타
}
registerEnumType(TrainingType, {
  name: 'TrainingType',
  description: '운동종류',
});

export enum Role {
  VERIFIED = 'VERIFIED',
  ADMIN = 'ADMIN',
}
registerEnumType(Role, {
  name: 'Role',
  description: '권한',
});
