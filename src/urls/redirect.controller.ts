import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UrlsService } from './urls.service';

@Controller()
export class RedirectController {
  constructor(private readonly service: UrlsService) {}

  // Acesso ao short code: contabiliza clique e redireciona
  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const updated = await this.service.incrementClick(code);
    return res.redirect(updated.originalUrl);
  }
}
