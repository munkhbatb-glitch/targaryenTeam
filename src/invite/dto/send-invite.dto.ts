import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendInviteDto {
  @IsEmail({}, { message: 'Зөв и-мэйл хаяг оруулна уу.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Өрөөний нэр заавал.' })
  @MaxLength(32)
  roomId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  hostName?: string;
}
