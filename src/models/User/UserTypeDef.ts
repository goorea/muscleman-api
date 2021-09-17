const UserTypeDef = `
  """
  사용자 객체
  """
  type User {
    id: ID!
    """
    이름
    """
    name: String!
    """
    이메일
    """
    email: String!
  }
  
  """
  사용자 입력 객체
  """
  input UserInput {
    """
    이름
    """
    name: String!
    """
    이메일
    """
    email: String!
  }
  
  type Query {
    """
    모든 사용자 조회
    """
    users: [User]
  }
  
  type Mutation {
    """
    사용자 생성
    """
    createUser(input: UserInput): User
    
    """
    사용자 삭제
    """
    deleteUser(id: ID): Boolean
  }
`;

export default UserTypeDef;
