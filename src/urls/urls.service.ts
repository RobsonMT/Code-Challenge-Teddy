import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import * as crypto from 'crypto';
import { User } from 'src/users/entities/user.entity';
import { UpdateUrlDto } from './dto/update-url.dto';

const SHORT_LEN = 6;

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url) private readonly urlRepo: Repository<Url>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private generateShortCode(): string {
    const code = crypto
      .randomBytes(4)
      .toString('base64url')
      .slice(0, SHORT_LEN);
    return code.replace(
      /[-_]/g,
      () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
          Math.floor(Math.random() * 62)
        ],
    );
  }

  async createShort(dto: CreateUrlDto, userId?: string) {
    for (let i = 0; i < 5; i++) {
      const shortCode = this.generateShortCode();

      const exists = await this.urlRepo.findOne({
        where: { shortCode, deletedAt: IsNull() },
      });

      if (!exists) {
        const userEntity = await this.userRepo.findOneBy({ id: userId });
        if (userId) {
          if (!userEntity) {
            throw new NotFoundException('User not found');
          }
        }

        const url = this.urlRepo.create({
          originalUrl: dto.originalUrl,
          shortCode,
          clicks: 0,
          user: userEntity!,
        });

        return this.urlRepo.save(url);
      }
    }

    throw new ConflictException('Failed to generate unique shortcode');
  }

  async findByCodeActiveOrThrow(shortCode: string) {
    const url = await this.urlRepo.findOne({
      where: { shortCode, deletedAt: IsNull() },
    });
    if (!url) throw new NotFoundException('URL not found');
    return url;
  }

  async incrementClick(shortCode: string) {
    const url = await this.findByCodeActiveOrThrow(shortCode);
    await this.urlRepo.increment({ id: url.id }, 'clicks', 1);
    const updated = await this.urlRepo.findOne({ where: { id: url.id } });
    return updated!;
  }

  async listMine(userId: string) {
    return this.urlRepo.find({
      where: { user: { id: userId }, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async updateMine(id: string, userId: string, dto: UpdateUrlDto) {
    const url = await this.urlRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user'],
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (!url.user || String(url.user.id) !== String(userId)) {
      throw new ForbiddenException('You are not allowed to update this URL.');
    }

    if (dto.originalUrl) {
      url.originalUrl = dto.originalUrl;
    }

    const newUrl = await this.urlRepo.save(url);

    return {
      id: newUrl.id,
      short_code: newUrl.shortCode,
      original_url: newUrl.originalUrl,
      clicks: newUrl.clicks,
      created_at: newUrl.createdAt,
      updated_at: newUrl.updatedAt,
    };
  }

  async softDeleteMine(id: string, userId: string) {
    const url = await this.urlRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user'],
    });

    if (!url) throw new NotFoundException('URL not found');

    if (!url.user || url.user.id !== userId)
      throw new ForbiddenException('Without permission');
    url.deletedAt = new Date();
    return await this.urlRepo.save(url);
  }
}
