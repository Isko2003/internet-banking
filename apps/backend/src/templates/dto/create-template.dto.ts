import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTemplateDto {
  @IsInt()
  debitAccountId: number;

  @IsInt()
  creditAccountId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  comment?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
