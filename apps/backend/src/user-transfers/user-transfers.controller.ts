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
import { UserTransfersService } from './user-transfers.service';
import { CreateUserTransferDto } from './dto/create-user-transfer.dto';

@UseGuards(JwtAuthGuard)
@Controller('userTransfers')
export class UserTransfersController {
  constructor(private userTransfersService: UserTransfersService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.userTransfersService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userTransfersService.findOne(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: number },
    @Body() dto: CreateUserTransferDto,
  ) {
    return this.userTransfersService.create(user.id, dto);
  }
}
