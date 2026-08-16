import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from '@prisma/client';

function generateIban(): string {
  const random = Math.random().toString().slice(2, 18).padEnd(16, '0');
  return `AZ${Math.floor(10 + Math.random() * 89)}NABZ${random}`;
}

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  private serialize(account: Account) {
    return {
      ...account,
      balance: Number(account.balance),
      blockedAmount: Number(account.blockedAmount),
    };
  }

  async findAllForUser(userId: number) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return accounts.map((a) => this.serialize(a));
  }

  async findOne(userId: number, id: number) {
    const account = await this.prisma.account.findUnique({ where: { id } });

    if (!account) {
      throw new NotFoundException('Hesab tapılmadı');
    }

    if (account.userId !== userId) {
      throw new ForbiddenException('Bu hesaba giriş icazəniz yoxdur');
    }

    return this.serialize(account);
  }

  async create(userId: number, dto: CreateAccountDto) {
    const account = await this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        currency: dto.currency,
        iban: dto.iban ?? generateIban(),
        balance: 1000,
        blockedAmount: 0,
      },
    });

    return this.serialize(account);
  }
}
