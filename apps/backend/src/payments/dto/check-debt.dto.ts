import { IsInt, IsNotEmpty, IsObject } from 'class-validator';

export class CheckDebtDto {
  @IsInt()
  providerId: number;

  @IsObject()
  @IsNotEmpty()
  fields: Record<string, string>;
}
