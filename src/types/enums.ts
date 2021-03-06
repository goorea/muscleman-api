import 'reflect-metadata';
import { registerEnumType } from 'type-graphql';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}
registerEnumType(Gender, { name: 'Gender', description: '성별' });

export enum TrainingCategory {
  WEIGHT = 'WEIGHT', // 중량 운동
  CALISTHENICS = 'CALISTHENICS', // 맨몸 운동
  CARDIOVASCULAR = 'CARDIOVASCULAR', // 유산소
}
registerEnumType(TrainingCategory, {
  name: 'TrainingCategory',
  description: '운동분류',
});

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

export enum SocialProvider {
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}
registerEnumType(SocialProvider, {
  name: 'SocialProvider',
  description: 'SNS 로그인 유형',
});
