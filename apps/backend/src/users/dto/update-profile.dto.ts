import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() birthDate?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() photoUrl?: string;
}
