import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@UseGuards(JwtAuthGuard)
@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.transfersService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transfersService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateTransferDto) {
    return this.transfersService.create(user.id, dto);
  }
}
