// update-appointment-status.use-case.ts
import { Injectable } from '@nestjs/common';
import { IAppointmentRepository } from '../../core/ports/appointment.repository';
import {
  AppointmentNotFoundError,
  InvalidAppointmentStatusError,
} from '../../core/exceptions';

@Injectable()
export class UpdateAppointmentStatusUseCase {
  constructor(private readonly repository: IAppointmentRepository) {}

  async execute(appointmentId: string, status: string): Promise<void> {
    const appointment = await this.repository.findById(appointmentId);
    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    if (!['pending', 'completed'].includes(status)) {
      throw new InvalidAppointmentStatusError(status);
    }
    await this.repository.updateStatus(appointmentId, status);
  }
}
