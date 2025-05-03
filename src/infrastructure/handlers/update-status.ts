/* import { SQSEvent } from 'aws-lambda';
import { DynamoAppointmentRepository } from '../repositories/dynamodb/dynamodb-appointment.repository';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';

export const handler = async (event: SQSEvent) => {
  const configService = new ConfigService();
  const dynamoDB = DynamoDBDocument.from(
    new DynamoDB({
      region: configService.get('AWS_REGION'),
    }),
  );

  const repo = new DynamoAppointmentRepository(dynamoDB, configService);

  for (const record of event.Records) {
    const { appointmentId } = JSON.parse(record.body);
    await repo.updateStatus(appointmentId, 'completed');
  }
}; */
