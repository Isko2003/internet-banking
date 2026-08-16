import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTransferDto {
  @IsInt()
  debitAccountId: number;

  @IsInt()
  creditAccountId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  exchangeRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  comment?: string;
}
