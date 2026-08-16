import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckDebtDto } from './dto/check-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private serialize(payment: any) {
    return {
      ...payment,
      amount: Number(payment.amount),
    };
  }

  async findAllForUser(userId: number) {
    const userAccounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });
    const accountIds = userAccounts.map((a) => a.id);

    const payments = await this.prisma.payment.findMany({
      where: { debitAccountId: { in: accountIds } },
      orderBy: { date: 'desc' },
    });

    return payments.map((p) => this.serialize(p));
  }

  async checkDebt(dto: CheckDebtDto) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { id: dto.providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provayder tapılmadı');
    }

    // Real provayder inteqrasiyası olmadığı üçün mock borc məbləği (mock server ilə eyni məntiq)
    const amount = Math.round((Math.random() * 90 + 10) * 100) / 100;

    return {
      amount,
      description: `${provider.name} üzrə borc`,
    };
  }

  async pay(userId: number, dto: CreatePaymentDto) {
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

    const provider = await this.prisma.paymentProvider.findUnique({
      where: { id: dto.providerId },
    });
    if (!provider) {
      throw new NotFoundException('Provayder tapılmadı');
    }

    if (Number(debitAccount.balance) < dto.amount) {
      throw new BadRequestException('Balans kifayət etmir');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const debitUpdate = await tx.account.updateMany({
        where: { id: debitAccount.id, balance: { gte: dto.amount } },
        data: { balance: { decrement: dto.amount } },
      });

      if (debitUpdate.count === 0) {
        throw new BadRequestException('Balans kifayət etmir');
      }

      const payment = await tx.payment.create({
        data: {
          debitAccountId: debitAccount.id,
          providerId: provider.id,
          category: provider.category,
          providerName: provider.name,
          fields: dto.fields,
          amount: dto.amount,
          description: dto.description || `${provider.name} ödənişi`,
          status: 'completed',
        },
      });

      await tx.transaction.create({
        data: {
          accountId: debitAccount.id,
          type: 'expense',
          amount: dto.amount,
          currency: debitAccount.currency,
          category: provider.category,
          description: dto.description || `${provider.name} ödənişi`,
          status: 'completed',
        },
      });

      return payment;
    });

    await this.notificationsService.createForUser(
      userId,
      `${provider.name} üzrə ${dto.amount} ${debitAccount.currency} ödəniş edildi`,
      'transaction',
    );

    return this.serialize(result);
  }
}
