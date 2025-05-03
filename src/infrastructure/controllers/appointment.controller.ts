import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UsePipes,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentResponseDto } from 'src/application/dto/appointment-response.dto';
import { CreateAppointmentDto } from 'src/application/dto/create-appointment.dto';
import { AppointmentService } from 'src/application/services/appointment.service';
import { Appointment } from 'src/core/domain/appointment.entity';
import { ValidationPipe } from 'src/shared/middleware/validation.pipe';

@ApiTags('Appointments')
@Controller('appointments')
@UsePipes(ValidationPipe)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new medical appointment' })
  @ApiResponse({ status: 201, type: AppointmentResponseDto })
  async create(
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    try {
      const appointment = await this.appointmentService.createAppointment(dto);
      return this.toResponseDto(appointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new InternalServerErrorException('Error creating appointment');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get appointments by insured ID' })
  @ApiResponse({ status: 200, type: [AppointmentResponseDto] })
  async getByInsuredId(
    @Query('insuredId') insuredId: string,
  ): Promise<AppointmentResponseDto[]> {
    const appointments =
      await this.appointmentService.getByInsuredId(insuredId);
    return appointments.map((appt) => this.toResponseDto(appt));
  }

  private toResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      insuredId: appointment.insuredId,
      scheduleId: appointment.scheduleId,
      countryISO: appointment.countryISO.toString(),
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}
