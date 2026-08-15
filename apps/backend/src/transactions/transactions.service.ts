import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private serialize(transaction: any) {
    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  }

  private async assertAccountOwnership(userId: number, accountId: number) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new NotFoundException('Hesab tapılmadı');
    if (account.userId !== userId) {
      throw new ForbiddenException('Bu hesaba giriş icazəniz yoxdur');
    }
  }

  async findPaginated(userId: number, query: QueryTransactionDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    if (query.accountId) {
      await this.assertAccountOwnership(userId, query.accountId);
    }

    const userAccounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });
    const accountIds = userAccounts.map((a) => a.id);

    const where: Prisma.TransactionWhereInput = {
      accountId: query.accountId ? query.accountId : { in: accountIds },
      status: query.status,
      category: query.category,
      date: {
        gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
        lte: query.dateTo ? new Date(query.dateTo) : undefined,
      },
      amount: {
        gte: query.minAmount,
        lte: query.maxAmount,
      },
      description: query.search
        ? { contains: query.search, mode: 'insensitive' }
        : undefined,
    };

    const [data, totalCount] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { [query.sort ?? 'date']: query.order ?? 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: data.map((t) => this.serialize(t)),
      totalCount,
      page,
      limit,
    };
  }

  async findRecent(userId: number, limit = 5) {
    const userAccounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const transactions = await this.prisma.transaction.findMany({
      where: { accountId: { in: userAccounts.map((a) => a.id) } },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return transactions.map((t) => this.serialize(t));
  }

  async findOne(userId: number, id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) throw new NotFoundException('Əməliyyat tapılmadı');

    await this.assertAccountOwnership(userId, transaction.accountId);

    return this.serialize(transaction);
  }
}
