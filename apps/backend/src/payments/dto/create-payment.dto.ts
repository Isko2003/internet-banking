import {
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  debitAccountId: number;

  @IsInt()
  providerId: number;

  @IsObject()
  fields: Record<string, string>;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
