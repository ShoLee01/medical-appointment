import { SQSEvent } from 'aws-lambda';
import { ChileSchedulerService } from 'src/application/services/scheduler/cl-scheduler.service';
import { MysqlAppointmentRepository } from '../repositories/mysql/mysql-appointment.repository';
import { Appointment } from 'src/core/domain/appointment.entity';
import { CountryISO } from 'src/core/domain/value-objects/country-iso';
import { EventBridgePublisher } from '../messaging/event-bridge/event-bridge-publisher';

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      const snsMessage = JSON.parse(message.Message);
      console.log('Processing message:', snsMessage);

      const processor = new ChileSchedulerService(
        new MysqlAppointmentRepository(snsMessage.countryISO),
        new EventBridgePublisher(),
      );
      const appointment = new Appointment(
        snsMessage.id,
        snsMessage.insuredId,
        snsMessage.scheduleId,
        new CountryISO(snsMessage.countryISO),
        'completed',
        new Date(),
        new Date(),
      );
      await processor.processAppointment(appointment);
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  }
};
