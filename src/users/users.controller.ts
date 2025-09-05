import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/auth/interfaces/auth-request.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.create(body.email, body.password);
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: AuthRequest) {
    const user = await this.usersService.findOneById(req.user.userId);
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Request() req: AuthRequest) {
    if (req.user.userId !== id) {
      return { message: 'You can only delete your own account.' };
    }
    await this.usersService.softRemove(id);
    return { message: 'User removed (soft delete).' };
  }
}
