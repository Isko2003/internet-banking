import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentProvidersService } from './payment-providers.service';

@UseGuards(JwtAuthGuard)
@Controller('providers')
export class PaymentProvidersController {
  constructor(private paymentProvidersService: PaymentProvidersService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.paymentProvidersService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentProvidersService.findOne(id);
  }
}
