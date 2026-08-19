import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '@/notifications/notifications.service';

// PrismaService-i tam mock edirik. `$transaction` real Prisma-da callback
// içindəki bütün sorğuları eyni "tx" client-i ilə icra edir — biz də elə
// edirik ki, callback-i sadəcə eyni mock obyektlə çağıraq.
function createPrismaMock() {
  const tx = {
    account: {
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    transfer: {
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
    transfer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
    __tx: tx, // testlərdən tx-in çağırışlarını yoxlamaq üçün
  };
}

describe('TransfersService', () => {
  let service: TransfersService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { createForUser: jest.Mock };

  const activeAccount = (overrides = {}) => ({
    id: 1,
    userId: 10,
    balance: 1000,
    currency: 'AZN',
    status: 'active',
    name: 'Əsas hesab',
    ...overrides,
  });

  beforeEach(async () => {
    prisma = createPrismaMock();
    notifications = { createForUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
  });

  describe('create — sahiblik və status yoxlanışları', () => {
    it('eyni hesaba köçürmə cəhdində BadRequestException atır', async () => {
      await expect(
        service.create(10, {
          debitAccountId: 1,
          creditAccountId: 1,
          amount: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('hesab tapılmayanda NotFoundException atır', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create(10, {
          debitAccountId: 1,
          creditAccountId: 2,
          amount: 100,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('hesab başqa istifadəçiyə məxsusdursa ForbiddenException atır', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(
        activeAccount({ userId: 999 }), // başqa istifadəçinin hesabı
      );

      await expect(
        service.create(10, {
          debitAccountId: 1,
          creditAccountId: 2,
          amount: 100,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('hesab aktiv deyilsə BadRequestException atır', async () => {
      prisma.account.findUnique.mockResolvedValueOnce(
        activeAccount({ status: 'blocked' }),
      );

      await expect(
        service.create(10, {
          debitAccountId: 1,
          creditAccountId: 2,
          amount: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('executeTransfer — eyni valyuta', () => {
    it('kifayət qədər balans yoxdursa BadRequestException atır (ilkin yoxlama)', async () => {
      const debit = activeAccount({ id: 1, balance: 50 });
      const credit = activeAccount({ id: 2, userId: 10 });
      prisma.account.findUnique
        .mockResolvedValueOnce(debit)
        .mockResolvedValueOnce(credit);

      await expect(
        service.create(10, {
          debitAccountId: 1,
          creditAccountId: 2,
          amount: 100, // balansdan çoxdur
        }),
      ).rejects.toThrow(BadRequestException);

      // Balans kifayət etmirsə, DB-yə əl belə vurulmamalıdır.
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('uğurlu köçürmədə fee=0, finalAmount=amount olur və düzgün sorğular gedir', async () => {
      const debit = activeAccount({ id: 1, balance: 1000, currency: 'AZN' });
      const credit = activeAccount({
        id: 2,
        userId: 10,
        currency: 'AZN',
        name: 'İkinci hesab',
      });
      prisma.account.findUnique
        .mockResolvedValueOnce(debit)
        .mockResolvedValueOnce(credit);

      prisma.__tx.account.updateMany.mockResolvedValueOnce({ count: 1 });
      prisma.__tx.transfer.create.mockResolvedValueOnce({
        id: 100,
        debitAccountId: 1,
        creditAccountId: 2,
        amount: 200,
        currency: 'AZN',
        fee: 0,
        finalAmount: 200,
        exchangeRate: null,
      });
      prisma.__tx.transaction.create
        .mockResolvedValueOnce({ id: 501 }) // debit transaction
        .mockResolvedValueOnce({ id: 502 }); // credit transaction

      const result = await service.create(10, {
        debitAccountId: 1,
        creditAccountId: 2,
        amount: 200,
      });

      expect(result.fee).toBe(0);
      expect(result.finalAmount).toBe(200);
      expect(result.transactionId).toBe(501);

      expect(prisma.__tx.account.updateMany).toHaveBeenCalledWith({
        where: { id: 1, balance: { gte: 200 } },
        data: { balance: { decrement: 200 } },
      });
      expect(prisma.__tx.account.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { balance: { increment: 200 } },
      });

      const debitTransactionCalls =
        prisma.__tx.transaction.create.mock.calls.filter(
          ([arg]) => arg.data.accountId === 1 && arg.data.type === 'expense',
        );
      expect(debitTransactionCalls).toHaveLength(1);

      expect(prisma.__tx.transaction.create).toHaveBeenCalledTimes(2);

      expect(notifications.createForUser).toHaveBeenCalledWith(
        10,
        expect.stringContaining('200 AZN'),
        'transaction',
      );
    });

    it('race condition: ilkin yoxlama keçsə də updateMany count=0 qaytarsa BadRequestException atır', async () => {
      const debit = activeAccount({ id: 1, balance: 1000 });
      const credit = activeAccount({ id: 2, userId: 10 });
      prisma.account.findUnique
        .mockResolvedValueOnce(debit)
        .mockResolvedValueOnce(credit);

      // Paralel bir başqa əməliyyat artıq balansı azaldıb — updateMany 0 sətir tutur.
      prisma.__tx.account.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        service.create(10, {
          debitAccountId: 1,
          creditAccountId: 2,
          amount: 200,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('executeTransfer — fərqli valyuta', () => {
    it('exchangeRate göndərilməyibsə BadRequestException atır', async () => {
      const debit = activeAccount({ id: 1, currency: 'AZN', balance: 1000 });
      const credit = activeAccount({ id: 2, userId: 10, currency: 'USD' });
      prisma.account.findUnique
        .mockResolvedValueOnce(debit)
        .mockResolvedValueOnce(credit);

      await expect(
        service.create(10, {
          debitAccountId: 1,
          creditAccountId: 2,
          amount: 100,
          // exchangeRate göndərilmir
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('komissiya və konvertasiya düzgün hesablanır', async () => {
      const debit = activeAccount({ id: 1, currency: 'AZN', balance: 1000 });
      const credit = activeAccount({ id: 2, userId: 10, currency: 'USD' });
      prisma.account.findUnique
        .mockResolvedValueOnce(debit)
        .mockResolvedValueOnce(credit);

      prisma.__tx.account.updateMany.mockResolvedValueOnce({ count: 1 });
      prisma.__tx.transfer.create.mockImplementationOnce(({ data }) =>
        Promise.resolve({ id: 200, ...data }),
      );
      prisma.__tx.transaction.create
        .mockResolvedValueOnce({ id: 601 })
        .mockResolvedValueOnce({ id: 602 });

      // amount=100, komissiya 1% => fee=1, afterFee=99, rate=0.588 => finalAmount=58.21 (yuvarlanmış)
      const result = await service.create(10, {
        debitAccountId: 1,
        creditAccountId: 2,
        amount: 100,
        exchangeRate: 0.588,
      });

      expect(result.fee).toBe(1);
      expect(result.finalAmount).toBeCloseTo(58.21, 2);
      expect(result.exchangeRate).toBe(0.588);
    });
  });
});
