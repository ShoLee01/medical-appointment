import { CountryISO } from './value-objects/country-iso';
import { InvalidAppointmentStatusError } from '../exceptions';

export type AppointmentStatus = 'pending' | 'completed';

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly insuredId: string,
    public readonly scheduleId: number,
    public readonly countryISO: CountryISO,
    public status: 'pending' | 'completed' = 'pending',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    this.validateInsuredId();
    this.validateScheduleId();
  }

  private validateInsuredId(): void {
    if (!/^\d{5}$/.test(this.insuredId)) {
      throw new Error('insuredId debe ser exactamente 5 dígitos');
    }
  }

  private validateScheduleId(): void {
    if (this.scheduleId <= 0 || !Number.isInteger(this.scheduleId)) {
      throw new Error('Invalid scheduleId');
    }
  }

  markAsCompleted(): void {
    if (this.status === 'completed') {
      throw new InvalidAppointmentStatusError('Appointment already completed');
    }
    this.status = 'completed';
    this.updatedAt = new Date();
  }
}
