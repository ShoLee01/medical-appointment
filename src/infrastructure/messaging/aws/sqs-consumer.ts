import { Injectable } from '@nestjs/common';
import {
  SQS,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { PeruSchedulerService } from 'src/application/services/scheduler/pe-scheduler.service';

interface AppointmentMessage {
  id: string;
}

@Injectable()
export class SqsPeConsumer {
  private readonly sqs: SQS;
  private readonly queueUrl: string;

  constructor(
    configService: ConfigService,
    private readonly schedulerService: PeruSchedulerService,
  ) {
    const region = configService.get<string>('AWS_REGION');
    const url = configService.get<string>('SQS_PE_URL');

    if (!region || !url) throw new Error('Missing AWS configuration');

    this.sqs = new SQS({ region });
    this.queueUrl = url;
  }

  async startListening(): Promise<void> {
    while (true) {
      const { Messages } = await this.sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        }),
      );
      if (Messages?.length) {
        await Promise.all(
          Messages.map(async (message: any) => {
            try {
              const body = message.Body
                ? (JSON.parse(message.Body) as AppointmentMessage)
                : null;

              if (body?.id) {
                await this.schedulerService.processAppointment(body.id);

                if (message.ReceiptHandle) {
                  await this.sqs.send(
                    new DeleteMessageCommand({
                      QueueUrl: this.queueUrl,
                      ReceiptHandle: message.ReceiptHandle,
                    }),
                  );
                }
              }
            } catch (error) {
              console.error(
                'Error processing message:',
                error instanceof Error ? error.message : error,
              );
            }
          }),
        );
      }
    }
  }
}
