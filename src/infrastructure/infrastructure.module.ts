import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AppointmentController } from './controllers/appointment.controller';
import { HealthController } from './controllers/health.controller';
import { DynamoAppointmentRepository } from './repositories/dynamodb/dynamodb-appointment.repository';
import { AwsSnsPublisher } from './messaging/aws/sns-publisher';
import { SqsPeConsumer } from './messaging/aws/sqs-consumer';

@Module({
  imports: [SharedModule],
  controllers: [AppointmentController, HealthController],
  providers: [
    {
      provide: 'IAppointmentRepository',
      useClass: DynamoAppointmentRepository,
    },
    AwsSnsPublisher,
    SqsPeConsumer,
  ],
  exports: ['IAppointmentRepository'],
})
export class InfrastructureModule {}
