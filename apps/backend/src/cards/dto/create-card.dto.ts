import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { CardType, PaymentSystem } from '@prisma/client';

export class CreateCardDto {
  @IsInt()
  accountId: number;

  @IsEnum(CardType)
  type: CardType;

  @IsEnum(PaymentSystem)
  paymentSystem: PaymentSystem;

  @IsString()
  @IsNotEmpty()
  holderName: string;
}
