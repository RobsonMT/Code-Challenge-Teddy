import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import * as dotenv from 'dotenv';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';

dotenv.config();

@Controller('urls')
export class UrlsController {
  constructor(private readonly service: UrlsService) {}

  // ÚNICO endpoint para encurtar (aceita anônimo ou autenticado)
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateUrlDto, @Request() req: AuthRequest) {
    const userId = req.user?.userId;
    const url = await this.service.createShort(dto, userId);
    const base = process.env.APP_URL!.replace(/\/$/, '');
    return {
      id: url.id,
      short_code: url.shortCode,
      short_url: `${base}/${url.shortCode}`,
      original_url: url.originalUrl,
      clicks: url.clicks,
      user_id: userId ?? null,
      created_at: url.createdAt,
      updated_at: url.updatedAt,
    };
  }

  // Listar minhas URLs com cliques (APENAS AUTENTICADO)
  @UseGuards(JwtAuthGuard)
  @Get()
  async listMine(@Request() req: AuthRequest) {
    const items = await this.service.listMine(req.user.userId);
    const base = process.env.APP_URL!.replace(/\/$/, '');
    return items.map((u) => ({
      id: u.id,
      short_code: u.shortCode,
      short_url: `${base}/${u.shortCode}`,
      original_url: u.originalUrl,
      clicks: u.clicks,
      created_at: u.createdAt,
      updated_at: u.updatedAt,
    }));
  }

  // Atualizar origem (APENAS AUTENTICADO)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUrlDto,
    @Request() req: AuthRequest,
  ) {
    return this.service.updateMine(id, req.user.userId, dto);
  }

  // Soft delete (APENAS AUTENTICADO)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest,
  ) {
    await this.service.softDeleteMine(id, req.user.userId);
    return { message: 'Url removed (soft delete).' };
  }
}
