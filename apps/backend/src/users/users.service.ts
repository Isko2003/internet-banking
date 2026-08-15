import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('İstifadəçi tapılmadı');
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });
    const { password, ...safeUser } = user;
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

  async updateSettings(
    userId: number,
    data: Partial<{
      language: 'az' | 'en';
      theme: 'light' | 'dark';
      notificationsEnabled: boolean;
      balanceHidden: boolean;
      inactivityTimeoutMinutes: number;
      twoFactorEnabled: boolean;
    }>,
  ) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
