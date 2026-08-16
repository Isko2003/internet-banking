import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserTransferDto } from './dto/create-user-transfer.dto';
import { NotificationsService } from '@/notifications/notifications.service';

const USER_TRANSFER_FEE_RATE = 0.02; // kart/iban köçürməsi üçün 2% komissiya

@Injectable()
export class UserTransfersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private serialize(userTransfer: any) {
    return {
      ...userTransfer,
      amount: Number(userTransfer.amount),
      fee: Number(userTransfer.fee),
    };
  }

  async findAllForUser(userId: number) {
    const transfers = await this.prisma.userTransfer.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return transfers.map((t) => this.serialize(t));
  }

  async findOne(userId: number, id: number) {
    const transfer = await this.prisma.userTransfer.findUnique({
      where: { id },
    });
    if (!transfer) throw new NotFoundException('Köçürmə tapılmadı');
    if (transfer.userId !== userId) {
      throw new ForbiddenException('Bu köçürməyə giriş icazəniz yoxdur');
    }
    return this.serialize(transfer);
  }

  async create(userId: number, dto: CreateUserTransferDto) {
    const debitAccount = await this.prisma.account.findUnique({
      where: { id: dto.debitAccountId },
    });

    if (!debitAccount) {
      throw new NotFoundException('Hesab tapılmadı');
    }
    if (debitAccount.userId !== userId) {
      throw new ForbiddenException('Bu hesaba giriş icazəniz yoxdur');
    }
    if (debitAccount.status !== 'active') {
      throw new BadRequestException('Hesab aktiv deyil');
    }

    const fee = Math.round(dto.amount * USER_TRANSFER_FEE_RATE * 100) / 100;
    const totalDebit = dto.amount; // fee məbləğin daxilindədir, əlavə tutulmur

    if (Number(debitAccount.balance) < totalDebit) {
      throw new BadRequestException('Balans kifayət deyil');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const debitUpdate = await tx.account.updateMany({
        where: { id: debitAccount.id, balance: { gte: totalDebit } },
        data: { balance: { decrement: totalDebit } },
      });

      if (debitUpdate.count === 0) {
        throw new BadRequestException('Balans kifayət deyil');
      }

      const userTransfer = await tx.userTransfer.create({
        data: {
          debitAccountId: debitAccount.id,
          userId,
          recipientType: dto.recipientType,
          recipientIdentifier: dto.recipientIdentifier,
          recipientName: dto.recipientName,
          amount: dto.amount,
          currency: debitAccount.currency,
          fee,
          purpose: dto.purpose,
          saveRecipient: dto.saveRecipient ?? false,
          status: 'completed',
        },
      });

      await tx.transaction.create({
        data: {
          accountId: debitAccount.id,
          type: 'expense',
          amount: dto.amount,
          currency: debitAccount.currency,
          category: 'transfer',
          description: dto.purpose || `Köçürmə (${dto.recipientName})`,
          status: 'completed',
        },
      });

      return userTransfer;
    });

    await this.notificationsService.createForUser(
      userId,
      `${dto.recipientName} adına ${dto.amount} ${debitAccount.currency} köçürüldü`,
      'transaction',
    );

    return this.serialize(result);
  }
}
