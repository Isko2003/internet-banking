import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const SUPPORTED_CURRENCIES = ['AZN', 'USD', 'EUR'];

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  currency: string;

  @IsOptional()
  @IsString()
  iban?: string;
}
