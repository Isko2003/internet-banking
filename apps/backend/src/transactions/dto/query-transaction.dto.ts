import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class QueryTransactionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  accountId?: number;

  @IsOptional()
  @IsIn(['completed', 'processing', 'declined', 'cancelled'])
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  maxAmount?: number;

  @IsOptional()
  @IsIn(['date', 'amount'])
  sort?: 'date' | 'amount' = 'date';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
