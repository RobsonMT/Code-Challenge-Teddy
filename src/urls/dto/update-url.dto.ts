import { IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @IsUrl({ require_tld: false })
  originalUrl: string;
}
