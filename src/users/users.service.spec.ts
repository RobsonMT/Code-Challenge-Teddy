import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MockType, repositoryMockFactory } from '../../test/utils';
import { Repository } from 'typeorm';

describe('UsersService (unit)', () => {
  let service: UsersService;
  let userRepoMock: MockType<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepoMock = module.get(getRepositoryToken(User));
  });

  it('UpdatePassword throws error when user does not exist', async () => {
    userRepoMock.findOne.mockResolvedValue(null);

    await expect(service.updatePassword('u1', 'nova123')).rejects.toThrow(
      `User with id u1 not found`,
    );
    expect(userRepoMock.save).not.toHaveBeenCalled();
  });
});
