import { Injectable } from '@nestjs/common';
import { MysqlAppointmentRepository } from 'src/infrastructure/repositories/mysql/mysql-appointment.repository';
import { Appointment } from 'src/core/domain/appointment.entity';
import { AppLogger } from 'src/shared/utils/logger.util';
import { EventBridgePublisher } from 'src/infrastructure/messaging/event-bridge/event-bridge-publisher';

@Injectable()
export class PeruSchedulerService {
  constructor(
    private readonly repository: MysqlAppointmentRepository,
    private readonly eventPublisher: EventBridgePublisher,
    private readonly logger: AppLogger = new AppLogger(),
  ) {}

  async processAppointment(appointment: Appointment): Promise<void> {
    // await this.repository.initializeTable();
    // await this.repository.save(appointment);
    await this.eventPublisher.publishAppointmentProcessed(
      appointment.id,
      appointment.countryISO.toString(),
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.logger.log(
      `Appointment ${appointment.id} processed successfully`,
      'PeruSchedulerService',
    );
  }
}
