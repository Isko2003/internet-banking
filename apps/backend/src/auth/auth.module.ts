import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenCleanupService } from './refresh-token-cleanup.service';
import { AccountsModule } from '@/accounts/accounts.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), AccountsModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenCleanupService],
})
export class AuthModule {}
