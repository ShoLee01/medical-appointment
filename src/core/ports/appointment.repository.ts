import { Appointment } from '../domain/appointment.entity';

export interface IAppointmentRepository {
  save(appointment: Appointment): Promise<Appointment>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  updateStatus(appointmentId: string, status: string): Promise<void>;
  findById(id: string): Promise<Appointment | null>;
}
