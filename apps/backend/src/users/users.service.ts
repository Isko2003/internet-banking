import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('İstifadəçi tapılmadı');

    const safeUser: Omit<User, 'password'> & { password?: string } = {
      ...user,
    };
    delete safeUser.password;
    return safeUser;
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    const safeUser: Omit<User, 'password'> & { password?: string } = {
      ...user,
    };
    delete safeUser.password;
    return safeUser;
  }

  async getSettings(userId: number) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: number, data: UpdateUserSettingsDto) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
