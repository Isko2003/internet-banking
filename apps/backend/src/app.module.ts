import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { CardsModule } from './cards/cards.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransfersModule } from './transfers/transfers.module';
import { TemplatesModule } from './templates/templates.module';
import { UserTransfersModule } from './user-transfers/user-transfers.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentProvidersModule } from './payment-providers/payment-providers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OtpModule } from './otp/otp.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    CardsModule,
    TransactionsModule,
    TransfersModule,
    TemplatesModule,
    UserTransfersModule,
    PaymentsModule,
    PaymentProvidersModule,
    NotificationsModule,
    OtpModule,
    ExchangeRatesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
