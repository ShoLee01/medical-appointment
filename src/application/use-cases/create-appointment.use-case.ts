import { Injectable } from '@nestjs/common';
import { IAppointmentRepository } from '../../core/ports/appointment.repository';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { Appointment } from '../../core/domain/appointment.entity';
import { CountryISO } from 'src/core/domain/value-objects/country-iso';
import { UuidUtil } from 'src/shared/utils/uuid.util';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(private readonly repository: IAppointmentRepository) {}

  async execute(dto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = new Appointment(
      UuidUtil.generate(),
      dto.insuredId,
      dto.scheduleId,
      new CountryISO(dto.countryISO),
    );

    return this.repository.save(appointment);
  }
}
