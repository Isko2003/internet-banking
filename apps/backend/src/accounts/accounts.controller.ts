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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.accountsService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.accountsService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(user.id, dto);
  }
}
