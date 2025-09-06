import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async createUser(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ email, password: hash });
    return this.usersRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async findOneById(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, salt);
    }

    Object.assign(user, dto, { updatedAt: new Date() });

    return await this.usersRepo.save(user);
  }

  async updatePassword(userId: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;

    return this.usersRepo.save(user);
  }

  async softRemove(id: string) {
    const user = await this.findOneById(id);
    user.deletedAt = new Date();
    return await this.usersRepo.save(user);
  }
}
