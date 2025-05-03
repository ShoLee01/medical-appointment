import { Injectable } from '@nestjs/common';
import { IAppointmentRepository } from '../../core/ports/appointment.repository';
import { Appointment } from '../../core/domain/appointment.entity';
import { EventPublisher } from '../../core/ports/event.publisher';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { CountryISO } from '../../core/domain/value-objects/country-iso';
import { UuidUtil } from 'src/shared/utils/uuid.util';
import { Logger } from '@nestjs/common';
import {
  AppointmentNotFoundError,
  InvalidAppointmentStatusError,
} from '../../core/exceptions';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private readonly repository: IAppointmentRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = new Appointment(
      UuidUtil.generate(),
      dto.insuredId,
      dto.scheduleId,
      new CountryISO(dto.countryISO),
    );

    const savedAppointment = await this.repository.save(appointment);
    await this.publishCreationEvent(savedAppointment);
    return savedAppointment;
  }

  async getByInsuredId(insuredId: string): Promise<Appointment[]> {
    return this.repository.findByInsuredId(insuredId);
  }

  async handleProcessedAppointment(appointmentId: string): Promise<void> {
    this.logger.log(`Processing appointment ${appointmentId}`);
    const appointment = await this.repository.findById(appointmentId);
    if (!appointment) {
      throw new AppointmentNotFoundError(appointmentId);
    }

    if (appointment.status !== 'pending') {
      throw new InvalidAppointmentStatusError(appointment.status);
    }

    appointment.markAsCompleted();
    await this.repository.updateStatus(appointment.id, appointment.status);
    await this.publishCompletionEvent(appointment);
  }

  private async publishCreationEvent(appointment: Appointment): Promise<void> {
    try {
      console.log('[DEBUG] Publicando evento a SNS:', {
        eventType: 'appointment_created',
        data: {
          id: appointment.id,
          countryISO: appointment.countryISO.toString(),
          scheduleId: appointment.scheduleId,
          insuredId: appointment.insuredId,
        },
      });
      await this.eventPublisher.publish('appointment_created', {
        id: appointment.id,
        countryISO: appointment.countryISO.toString(),
        scheduleId: appointment.scheduleId,
        insuredId: appointment.insuredId,
      });
    } catch (error) {
      console.error('[ERROR] Fallo al publicar evento a SNS:', {
        error: error.message,
        stack: error.stack,
        appointmentId: appointment.id,
      });
    }
  }

  private async publishCompletionEvent(
    appointment: Appointment,
  ): Promise<void> {
    await this.eventPublisher.publish('appointment_completed', {
      id: appointment.id,
      status: appointment.status,
      processedAt: new Date().toISOString(),
    });
  }
}
