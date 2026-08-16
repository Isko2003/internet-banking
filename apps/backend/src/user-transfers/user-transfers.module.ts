import { Module } from '@nestjs/common';
import { UserTransfersController } from './user-transfers.controller';
import { UserTransfersService } from './user-transfers.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [UserTransfersController],
  providers: [UserTransfersService],
})
export class UserTransfersModule {}
