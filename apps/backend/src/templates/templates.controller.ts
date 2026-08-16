import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.templatesService.findAllForUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.templatesService.remove(user.id, id);
  }
}
