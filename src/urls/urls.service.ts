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
import { UpdateUrlDto } from './dto/update-url.dto';
import * as crypto from 'crypto';

const SHORT_LEN = 6;

@Injectable()
export class UrlsService {
  constructor(@InjectRepository(Url) private readonly repo: Repository<Url>) {}

  private generateShortCode(): string {
    // Base64URL, cortado para 6 chars; garante [A-Za-z0-9-_]
    // Se quiser só Base62, troque '-' e '_' por letras
    const code = crypto
      .randomBytes(4)
      .toString('base64url')
      .slice(0, SHORT_LEN);
    // opcional: substituir '-' e '_' por letras para ficar [A-Za-z0-9]
    return code.replace(
      /[-_]/g,
      () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
          Math.floor(Math.random() * 62)
        ],
    );
  }

  async createShort(dto: CreateUrlDto, userId?: string) {
    // tenta algumas vezes para evitar colisão
    for (let i = 0; i < 5; i++) {
      const shortCode = this.generateShortCode();
      const exists = await this.repo.findOne({
        where: { shortCode, deletedAt: IsNull() },
      });
      if (!exists) {
        const url = this.repo.create({
          originalUrl: dto.originalUrl,
          shortCode,
          user: userId ? { id: userId } : null,
        });
        const saved = await this.repo.save(url);
        return saved;
      }
    }
    throw new ConflictException('Falha ao gerar código curto único');
  }

  async findByCodeActiveOrThrow(shortCode: string) {
    const url = await this.repo.findOne({
      where: { shortCode, deletedAt: IsNull() },
    });
    if (!url) throw new NotFoundException('URL não encontrada');
    return url;
  }

  async incrementClick(shortCode: string) {
    const url = await this.findByCodeActiveOrThrow(shortCode);
    // incremento atômico
    await this.repo.increment({ id: url.id }, 'clicks', 1);
    const updated = await this.repo.findOne({ where: { id: url.id } });
    return updated!;
  }

  async listMine(userId: string) {
    return this.repo.find({
      where: { user: { id: userId }, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async updateMine(id: string, userId: string, dto: UpdateUrlDto) {
    const url = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user'],
    });
    if (!url) throw new NotFoundException('URL não encontrada');
    if (!url.user || url.user.id !== userId)
      throw new ForbiddenException('Sem permissão');
    url.originalUrl = dto.originalUrl;
    return this.repo.save(url);
  }

  async softDeleteMine(id: string, userId: string) {
    const url = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user'],
    });
    if (!url) throw new NotFoundException('URL não encontrada');
    if (!url.user || url.user.id !== userId)
      throw new ForbiddenException('Sem permissão');
    await this.repo.softRemove(url);
    return { success: true };
  }
}
