import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateTemplateDto {
  @IsOptional()
  @IsInt()
  debitAccountId?: number;

  @IsOptional()
  @IsInt()
  creditAccountId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  comment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
