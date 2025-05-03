import { ApiProperty } from '@nestjs/swagger';

export class AppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  insuredId: string;

  @ApiProperty()
  scheduleId: number;

  @ApiProperty({ enum: ['PE', 'CL'] })
  countryISO: string;

  @ApiProperty({ enum: ['pending', 'completed'] })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
