import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '@/notifications/notifications.service';

function createPrismaMock() {
  const tx = {
    account: {
      updateMany: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
  };

  return {
    account: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    paymentProvider: {
      findUnique: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
    __tx: tx,
  };
}

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { createForUser: jest.Mock };

  const activeAccount = (overrides = {}) => ({
    id: 1,
    userId: 10,
    balance: 500,
    currency: 'AZN',
    status: 'active',
    ...overrides,
  });

  const provider = (overrides = {}) => ({
    id: 5,
    name: 'Azərişıq',
    category: 'utilities',
    ...overrides,
  });

  beforeEach(async () => {
    prisma = createPrismaMock();
    notifications = { createForUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('checkDebt', () => {
    it('provayder tapılmayanda NotFoundException atır', async () => {
      prisma.paymentProvider.findUnique.mockResolvedValueOnce(null);

      await expect(service.checkDebt({ providerId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('provayder tapılanda borc məbləği qaytarır', async () => {
      prisma.paymentProvider.findUnique.mockResolvedValueOnce(provider());

      const result = await service.checkDebt({ providerId: 5 });

      expect(result.description).toContain('Azərişıq');
      expect(typeof result.amount).toBe('number');
      expect(result.amount).toBeGreaterThan(0);
    });
  });

  describe('pay — sahiblik və vəziyyət yoxlanışları', () => {
    it('hesab tapılmayanda NotFoundException atır', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.pay(10, {
          debitAccountId: 1,
          providerId: 5,
          amount: 20,
          fields: {},
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('hesab başqa istifadəçiyə məxsusdursa ForbiddenException atır', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(
        activeAccount({ userId: 999 }),
      );

      await expect(
        service.pay(10, {
          debitAccountId: 1,
          providerId: 5,
          amount: 20,
          fields: {},
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('hesab aktiv deyilsə BadRequestException atır', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(
        activeAccount({ status: 'blocked' }),
      );

      await expect(
        service.pay(10, {
          debitAccountId: 1,
          providerId: 5,
          amount: 20,
          fields: {},
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('provayder tapılmayanda NotFoundException atır', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(activeAccount());
      prisma.paymentProvider.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.pay(10, {
          debitAccountId: 1,
          providerId: 999,
          amount: 20,
          fields: {},
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('balans kifayət etmirsə BadRequestException atır (ilkin yoxlama)', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(
        activeAccount({ balance: 10 }),
      );
      prisma.paymentProvider.findUnique.mockResolvedValueOnce(provider());

      await expect(
        service.pay(10, {
          debitAccountId: 1,
          providerId: 5,
          amount: 50, // balansdan çoxdur
          fields: {},
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('race condition: updateMany count=0 qaytarsa BadRequestException atır', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(
        activeAccount({ balance: 500 }),
      );
      prisma.paymentProvider.findUnique.mockResolvedValueOnce(provider());
      prisma.__tx.account.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        service.pay(10, {
          debitAccountId: 1,
          providerId: 5,
          amount: 50,
          fields: {},
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('uğurlu ödənişdə balans azalır, payment və transaction yaradılır, bildiriş göndərilir', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(
        activeAccount({ balance: 500 }),
      );
      prisma.paymentProvider.findUnique.mockResolvedValueOnce(provider());
      prisma.__tx.account.updateMany.mockResolvedValueOnce({ count: 1 });
      prisma.__tx.payment.create.mockImplementationOnce(({ data }) =>
        Promise.resolve({ id: 300, ...data }),
      );
      prisma.__tx.transaction.create.mockResolvedValueOnce({ id: 701 });

      const result = await service.pay(10, {
        debitAccountId: 1,
        providerId: 5,
        amount: 50,
        fields: { subscriberId: '12345' },
      });

      expect(result.transactionId).toBe(701);
      expect(prisma.__tx.account.updateMany).toHaveBeenCalledWith({
        where: { id: 1, balance: { gte: 50 } },
        data: { balance: { decrement: 50 } },
      });
      expect(notifications.createForUser).toHaveBeenCalledWith(
        10,
        expect.stringContaining('50 AZN'),
        'transaction',
      );
    });
  });
});
