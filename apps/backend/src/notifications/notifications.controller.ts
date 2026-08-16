import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }) {
    return this.notificationsService.findAllForUser(user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.remove(user.id, id);
  }
}
