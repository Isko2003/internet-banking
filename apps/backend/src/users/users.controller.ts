import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: { id: number }) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/settings')
  getSettings(@CurrentUser() user: { id: number }) {
    return this.usersService.getSettings(user.id);
  }

  @Patch('me/settings')
  updateSettings(
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateUserSettingsDto,
  ) {
    return this.usersService.updateSettings(user.id, dto);
  }
}
