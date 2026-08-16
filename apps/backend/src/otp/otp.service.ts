import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const OTP_TTL_MS = 2 * 60 * 1000; // 2 dəqiqə
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async send(userId: number, purpose: string) {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    const session = await this.prisma.otpSession.create({
      data: { userId, purpose, codeHash, expiresAt },
    });

    console.log(`[OTP] user=${userId} purpose=${purpose} code=${code}`);

    return { sessionId: session.sessionId, expiresAt: session.expiresAt };
  }

  async verify(userId: number, sessionId: string, code: string) {
    const session = await this.prisma.otpSession.findUnique({
      where: { sessionId },
    });

    if (!session) throw new NotFoundException('OTP sessiyası tapılmadı');
    if (session.userId !== userId) {
      throw new ForbiddenException('Bu OTP sessiyasına icazəniz yoxdur');
    }
    if (session.consumed) {
      throw new BadRequestException('Bu OTP artıq istifadə olunub');
    }
    if (session.expiresAt < new Date()) {
      throw new BadRequestException('OTP kodunun vaxtı bitib');
    }
    if (session.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException('Cəhd limiti aşıldı, yeni kod tələb edin');
    }

    const isValid = await bcrypt.compare(code, session.codeHash);

    if (!isValid) {
      await this.prisma.otpSession.update({
        where: { sessionId },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('OTP kodu yanlışdır');
    }

    await this.prisma.otpSession.update({
      where: { sessionId },
      data: { verified: true },
    });

    return { message: 'OTP təsdiqləndi' };
  }

  async consumeVerifiedSession(
    userId: number,
    sessionId: string,
    purpose: string,
  ) {
    const session = await this.prisma.otpSession.findUnique({
      where: { sessionId },
    });

    if (!session) throw new NotFoundException('OTP sessiyası tapılmadı');
    if (session.userId !== userId) {
      throw new ForbiddenException('Bu OTP sessiyasına icazəniz yoxdur');
    }
    if (session.purpose !== purpose) {
      throw new BadRequestException('OTP sessiyası bu əməliyyat üçün deyil');
    }
    if (!session.verified) {
      throw new BadRequestException('OTP hələ təsdiqlənməyib');
    }
    if (session.consumed) {
      throw new BadRequestException('Bu OTP artıq istifadə olunub');
    }
    if (session.expiresAt < new Date()) {
      throw new BadRequestException('OTP kodunun vaxtı bitib');
    }

    await this.prisma.otpSession.update({
      where: { sessionId },
      data: { consumed: true },
    });
  }
}
