import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  sessionId: string;

  @IsString()
  @Length(6, 6, { message: 'OTP kodu 6 rəqəmdən ibarət olmalıdır' })
  code: string;
}
