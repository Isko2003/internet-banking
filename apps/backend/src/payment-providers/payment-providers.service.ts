import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentProvidersService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.paymentProvider.findMany({
      where: category ? { category } : undefined,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { id },
    });
    if (!provider) throw new NotFoundException('Provayder tapılmadı');
    return provider;
  }
}
