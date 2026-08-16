import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserTransferDto {
  @IsInt()
  debitAccountId: number;

  @IsIn(['card', 'iban'])
  recipientType: 'card' | 'iban';

  @IsString()
  @IsNotEmpty()
  recipientIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  recipientName: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  purpose?: string;

  @IsOptional()
  @IsBoolean()
  saveRecipient?: boolean;

  @IsString()
  @IsNotEmpty()
  otpSessionId: string;
}
