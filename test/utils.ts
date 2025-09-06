export type MockType<T> = {
  [P in keyof T]: jest.Mock<any, any>;
};

export const repositoryMockFactory: () => MockType<any> = jest.fn(() => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  increment: jest.fn(),
  softRemove: jest.fn(),
  delete: jest.fn(),
}));
