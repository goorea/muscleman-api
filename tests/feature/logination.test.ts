describe('사용자 로그인', () => {
  it('로그인한 사용자는 요청할 수 없다', () => {});
});

// 로그인한 사용자는 요청할 수 없다
// 이메일 필드는 반드시 필요하다
// 비밀번호 필드는 반드시 필요하다
// 사용자 이메일이 존재하지 않는 이메일이면 에러를 반환한다
// 사용자 정보가 올바르지 않으면 에러를 반환한다
// 사용자 정보가 올바르면 JWT 토큰과 Refresh 토큰을 반환한다
// 만료된 토큰을 갱신할 수 있다
