import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Card } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';

function generateCardNumber(): string {
  const last4 = Math.floor(1000 + Math.random() * 9000);
  return `4169 **** **** ${last4}`;
}

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  private serialize(card: Card) {
    return {
      ...card,
      balance: Number(card.balance),
      dailyLimit: Number(card.dailyLimit),
    };
  }

  async findAllForUser(userId: number) {
    const cards = await this.prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return cards.map((c: Card) => this.serialize(c));
  }

  async findOne(userId: number, id: number) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Kart tapılmadı');
    if (card.userId !== userId) throw new ForbiddenException('İcazə yoxdur');
    return this.serialize(card);
  }

  async create(userId: number, dto: CreateCardDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });

    if (!account || account.userId !== userId) {
      throw new ForbiddenException('Bu hesaba kart əlavə edə bilməzsiniz');
    }

    const card = await this.prisma.card.create({
      data: {
        userId,
        accountId: dto.accountId,
        number: generateCardNumber(),
        type: dto.type,
        paymentSystem: dto.paymentSystem,
        expiry: this.generateExpiry(),
        holderName: dto.holderName.toUpperCase(),
        dailyLimit: dto.type === 'credit' ? 1500 : 800,
      },
    });

    return this.serialize(card);
  }

  async updateStatus(userId: number, id: number, status: 'active' | 'blocked') {
    await this.findOne(userId, id);
    const updated = await this.prisma.card.update({
      where: { id },
      data: { status },
    });
    return this.serialize(updated);
  }

  private generateExpiry(): string {
    const now = new Date();
    const year = (now.getFullYear() + 4).toString().slice(2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${month}/${year}`;
  }
}
