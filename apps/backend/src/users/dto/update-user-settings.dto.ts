import { IsOptional, IsIn, IsBoolean, IsInt, Min, Max } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsIn(['az', 'en'])
  language?: 'az' | 'en';

  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: 'light' | 'dark';

  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  balanceHidden?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  inactivityTimeoutMinutes?: number;

  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}
