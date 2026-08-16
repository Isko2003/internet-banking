import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CheckDebtDto } from './dto/check-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.paymentsService.findAllForUser(user.id);
  }

  @Post('check')
  checkDebt(@Body() dto: CheckDebtDto) {
    return this.paymentsService.checkDebt(dto);
  }

  @Post('pay')
  pay(@CurrentUser() user: { id: number }, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.pay(user.id, dto);
  }
}
