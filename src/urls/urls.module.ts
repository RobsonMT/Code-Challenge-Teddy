import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { RedirectController } from './redirect.controller';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url, User])],
  providers: [UrlsService],
  controllers: [UrlsController, RedirectController],
})
export class UrlsModule {}
