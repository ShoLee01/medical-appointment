import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsIn,
  Length,
  Matches,
  IsPositive,
  IsInt,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    example: '00123',
    description: 'ID del asegurado (5 dígitos numéricos)',
  })
  @IsString()
  @Length(5, 5)
  @Matches(/^\d{5}$/, { message: 'insuredId debe ser exactamente 5 dígitos' })
  insuredId: string;

  @ApiProperty({ example: 100, description: 'ID del horario programado' })
  @IsPositive()
  @IsInt()
  scheduleId: number;

  @ApiProperty({ enum: ['PE', 'CL'], description: 'Código de país ISO' })
  @IsIn(['PE', 'CL'])
  countryISO: string;
}
