import { IsIn } from 'class-validator';

export class SendOtpDto {
  @IsIn(['user-transfer'])
  purpose: 'user-transfer';
}
