import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { IsIn } from 'class-validator';

class UpdateCardStatusDto {
  @IsIn(['active', 'blocked'])
  status: 'active' | 'blocked';
}

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.cardsService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cardsService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateCardDto) {
    return this.cardsService.create(user.id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCardStatusDto,
  ) {
    return this.cardsService.updateStatus(user.id, id, dto.status);
  }
}
