import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { NotificationsService } from '@/notifications/notifications.service';
import { Transfer } from '@prisma/client';

const TRANSFER_FEE_RATE = 0.01;

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private serialize(transfer: Transfer) {
    return {
      ...transfer,
      amount: Number(transfer.amount),
      fee: Number(transfer.fee),
      finalAmount: Number(transfer.finalAmount),
      exchangeRate: transfer.exchangeRate
        ? Number(transfer.exchangeRate)
        : null,
    };
  }

  private async getOwnedAccount(
    userId: number,
    accountId: number,
  ): Promise<Account> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Hesab tapılmadı');
    }
    if (account.userId !== userId) {
      throw new ForbiddenException('Bu hesaba giriş icazəniz yoxdur');
    }
    if (account.status !== 'active') {
      throw new BadRequestException('Hesab aktiv deyil');
    }

    return account;
  }

  async findAllForUser(userId: number) {
    const userAccounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });
    const accountIds = userAccounts.map((a) => a.id);

    const transfers = await this.prisma.transfer.findMany({
      where: {
        OR: [
          { debitAccountId: { in: accountIds } },
          { creditAccountId: { in: accountIds } },
        ],
      },
      orderBy: { date: 'desc' },
    });

    return transfers.map((t) => this.serialize(t));
  }

  async findOne(userId: number, id: number) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('Köçürmə tapılmadı');

    const debitAccount = await this.prisma.account.findUnique({
      where: { id: transfer.debitAccountId },
    });
    const creditAccount = await this.prisma.account.findUnique({
      where: { id: transfer.creditAccountId },
    });

    const belongsToUser =
      debitAccount?.userId === userId || creditAccount?.userId === userId;
    if (!belongsToUser) {
      throw new ForbiddenException('Bu köçürməyə giriş icazəniz yoxdur');
    }

    return this.serialize(transfer);
  }

  async create(userId: number, dto: CreateTransferDto) {
    if (dto.debitAccountId === dto.creditAccountId) {
      throw new BadRequestException('Eyni hesaba köçürmə edə bilməzsiniz');
    }

    // Hər iki hesab da bu istifadəçiyə məxsus olmalıdır (öz hesabları arası köçürmə)
    const debitAccount = await this.getOwnedAccount(userId, dto.debitAccountId);
    const creditAccount = await this.getOwnedAccount(
      userId,
      dto.creditAccountId,
    );

    return this.executeTransfer(debitAccount, creditAccount, dto);
  }

  private async executeTransfer(
    debitAccount: Account,
    creditAccount: Account,
    dto: CreateTransferDto,
  ) {
    const currenciesDiffer = debitAccount.currency !== creditAccount.currency;
    const amount = dto.amount;

    if (Number(debitAccount.balance) < amount) {
      throw new BadRequestException('Balans kifayət deyil');
    }

    let exchangeRate: number | null = null;
    if (currenciesDiffer) {
      if (!dto.exchangeRate) {
        throw new BadRequestException(
          'Fərqli valyutalar arasında köçürmə üçün məzənnə tələb olunur',
        );
      }
      exchangeRate = dto.exchangeRate;
    }

    const fee = currenciesDiffer
      ? Math.round(amount * TRANSFER_FEE_RATE * 100) / 100
      : 0;
    const afterFee = amount - fee;
    const finalAmount = currenciesDiffer
      ? Math.round(afterFee * (exchangeRate as number) * 100) / 100
      : afterFee;

    const result = await this.prisma.$transaction(async (tx) => {
      // Race condition-lardan qorunmaq üçün balansı şərtlə birlikdə azaldırıq (Faza 5-də daha da gücləndiriləcək)
      const debitUpdate = await tx.account.updateMany({
        where: { id: debitAccount.id, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });

      if (debitUpdate.count === 0) {
        throw new BadRequestException('Balans kifayət deyil');
      }

      await tx.account.update({
        where: { id: creditAccount.id },
        data: { balance: { increment: finalAmount } },
      });

      const transfer = await tx.transfer.create({
        data: {
          debitAccountId: debitAccount.id,
          creditAccountId: creditAccount.id,
          amount,
          currency: debitAccount.currency,
          fee,
          finalAmount,
          exchangeRate,
          comment: dto.comment,
          status: 'completed',
        },
      });

      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: debitAccount.id,
          type: 'expense',
          amount,
          currency: debitAccount.currency,
          category: 'transfer',
          description: dto.comment || `Köçürmə (${creditAccount.name})`,
          status: 'completed',
        },
      });

      await tx.transaction.create({
        data: {
          accountId: creditAccount.id,
          type: 'income',
          amount: finalAmount,
          currency: creditAccount.currency,
          category: 'transfer',
          description: dto.comment || `Köçürmə (${debitAccount.name})`,
          status: 'completed',
        },
      });

      return { ...transfer, transactionId: debitTransaction.id };
    });

    await this.notificationsService.createForUser(
      debitAccount.userId,
      `${amount} ${debitAccount.currency} məbləğində köçürmə uğurla tamamlandı`,
      'transaction',
    );

    return this.serialize(result);
  }
}
