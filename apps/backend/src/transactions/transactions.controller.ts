import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: number },
    @Query() query: QueryTransactionDto,
  ) {
    return this.transactionsService.findPaginated(user.id, query);
  }

  @Get('recent')
  findRecent(
    @CurrentUser() user: { id: number },
    @Query('limit') limit?: number,
  ) {
    return this.transactionsService.findRecent(
      user.id,
      limit ? Number(limit) : 5,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionsService.findOne(user.id, id);
  }
}
