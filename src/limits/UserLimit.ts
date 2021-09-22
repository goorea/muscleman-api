export const UserLimit = {
  name: {
    minLength: 2,
    maxLength: 6,
  },
  nickname: {
    minLength: 2,
    maxLength: 8,
  },
  password: {
    minLength: 8,
  },
  birth: {
    minDate: new Date(1900, 0, 1),
    maxDate: new Date(new Date().getFullYear() - 8, 0, 1),
  },
  height: {
    min: 67,
    max: 250,
  },
  weight: {
    min: 30,
    max: 350,
  },
};
