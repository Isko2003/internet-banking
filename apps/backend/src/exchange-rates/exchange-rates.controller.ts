import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExchangeRatesService } from './exchange-rates.service';

@UseGuards(JwtAuthGuard)
@Controller('rates')
export class ExchangeRatesController {
  constructor(private exchangeRatesService: ExchangeRatesService) {}

  @Get()
  getRates(@Query('base') base?: string) {
    return this.exchangeRatesService.getRates(base ?? 'AZN');
  }
}
