import { IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({ require_tld: false }) // aceita localhost em dev
  originalUrl: string;
}
