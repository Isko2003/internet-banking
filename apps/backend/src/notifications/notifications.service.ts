import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: number) {
    return this.prisma.appNotification.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  private async findOwned(userId: number, id: number) {
    const notification = await this.prisma.appNotification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Bildiriş tapılmadı');
    if (notification.userId !== userId) {
      throw new ForbiddenException('Bu bildirişə giriş icazəniz yoxdur');
    }
    return notification;
  }

  async update(userId: number, id: number, dto: UpdateNotificationDto) {
    await this.findOwned(userId, id);
    return this.prisma.appNotification.update({
      where: { id },
      data: { read: dto.read },
    });
  }

  async remove(userId: number, id: number) {
    await this.findOwned(userId, id);
    await this.prisma.appNotification.delete({ where: { id } });
    return { message: 'Bildiriş silindi' };
  }

  // Digər modullardan (Transfers, UserTransfers, Payments, Cards) çağırmaq üçün köməkçi metod
  async createForUser(
    userId: number,
    message: string,
    type: NotificationType = 'info',
  ) {
    return this.prisma.appNotification.create({
      data: { userId, message, type },
    });
  }
}
