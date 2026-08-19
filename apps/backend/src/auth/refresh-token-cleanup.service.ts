import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefreshTokenCleanupService {
  private readonly logger = new Logger(RefreshTokenCleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ revoked: true }, { expiresAt: { lt: new Date() } }],
      },
    });

    if (result.count > 0) {
      this.logger.log(`${result.count} köhnə refresh token silindi`);
    }
  }
}
