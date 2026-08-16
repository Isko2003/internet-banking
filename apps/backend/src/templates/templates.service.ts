import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransferTemplate } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  private serialize(template: TransferTemplate) {
    return {
      ...template,
      amount: Number(template.amount),
    };
  }

  private async assertOwnedAccount(userId: number, accountId: number) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Hesab tapılmadı');
    }
    if (account.userId !== userId) {
      throw new ForbiddenException('Bu hesaba giriş icazəniz yoxdur');
    }
  }

  async findAllForUser(userId: number) {
    const templates = await this.prisma.transferTemplate.findMany({
      where: { userId },
      orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
    });
    return templates.map((t: TransferTemplate) => this.serialize(t));
  }

  private async findOwned(userId: number, id: number) {
    const template = await this.prisma.transferTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Şablon tapılmadı');
    if (template.userId !== userId) {
      throw new ForbiddenException('Bu şablona giriş icazəniz yoxdur');
    }
    return template;
  }

  async create(userId: number, dto: CreateTemplateDto) {
    await this.assertOwnedAccount(userId, dto.debitAccountId);
    await this.assertOwnedAccount(userId, dto.creditAccountId);

    const template = await this.prisma.transferTemplate.create({
      data: {
        userId,
        debitAccountId: dto.debitAccountId,
        creditAccountId: dto.creditAccountId,
        amount: dto.amount,
        comment: dto.comment,
        name: dto.name,
        isFavorite: dto.isFavorite ?? false,
      },
    });

    return this.serialize(template);
  }

  async update(userId: number, id: number, dto: UpdateTemplateDto) {
    await this.findOwned(userId, id);

    if (dto.debitAccountId) {
      await this.assertOwnedAccount(userId, dto.debitAccountId);
    }
    if (dto.creditAccountId) {
      await this.assertOwnedAccount(userId, dto.creditAccountId);
    }

    const updated = await this.prisma.transferTemplate.update({
      where: { id },
      data: dto,
    });

    return this.serialize(updated);
  }

  async remove(userId: number, id: number) {
    await this.findOwned(userId, id);
    await this.prisma.transferTemplate.delete({ where: { id } });
    return { message: 'Şablon silindi' };
  }
}
