import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@UseGuards(JwtAuthGuard)
@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('send')
  send(@CurrentUser() user: { id: number }, @Body() dto: SendOtpDto) {
    return this.otpService.send(user.id, dto.purpose);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify')
  verify(@CurrentUser() user: { id: number }, @Body() dto: VerifyOtpDto) {
    return this.otpService.verify(user.id, dto.sessionId, dto.code);
  }
}
