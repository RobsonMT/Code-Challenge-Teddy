import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './urls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { ConflictException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { MockType, repositoryMockFactory } from '../../test/utils';

describe('UrlsService (unit)', () => {
  let service: UrlsService;
  let urlRepoMock: MockType<any>;
  let userRepoMock: MockType<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        { provide: getRepositoryToken(Url), useFactory: repositoryMockFactory },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    urlRepoMock = module.get(getRepositoryToken(Url));
    userRepoMock = module.get(getRepositoryToken(User));
  });

  it('Creates short url and associates user when userId exists', async () => {
    urlRepoMock.findOne.mockResolvedValue(null);

    userRepoMock.findOneBy.mockResolvedValue({ id: 'user-1' });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    urlRepoMock.create.mockImplementation((v) => v);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    urlRepoMock.save.mockImplementation((v) => ({ id: 'url-1', ...v }));

    const dto = { originalUrl: 'https://a.com' };
    const result = await service.createShort(dto, 'user-1');

    expect(userRepoMock.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
    expect(urlRepoMock.save).toHaveBeenCalled();
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe('user-1');
  });

  it('Throws ConflictException if unable to generate unique code', async () => {
    urlRepoMock.findOne.mockResolvedValue({ shortCode: 'x' });

    await expect(
      service.createShort({ originalUrl: 'https://xpto.com' }, undefined),
    ).rejects.toThrow(ConflictException);
  });
});
