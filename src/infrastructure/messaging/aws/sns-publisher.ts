import { Injectable } from '@nestjs/common';
import { SNS, PublishCommand } from '@aws-sdk/client-sns';
import { EventPublisher } from 'src/core/ports/event.publisher';

@Injectable()
export class AwsSnsPublisher implements EventPublisher {
  private readonly sns: SNS;
  private readonly topicArn: string;

  constructor() {
    const region = process.env.AWS_REGION;
    if (!region) throw new Error('AWS_REGION no está definido');
    const topicArn = process.env.SNS_TOPIC_ARN;
    if (!topicArn) throw new Error('SNS_TOPIC_ARN no está definido');
    this.sns = new SNS({ region });
    this.topicArn = topicArn;
  }

  async publish(
    eventType: string,
    data: { countryISO: string },
  ): Promise<void> {
    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: JSON.stringify(data),
      MessageAttributes: {
        countryISO: { DataType: 'String', StringValue: data.countryISO },
        eventType: { DataType: 'String', StringValue: eventType },
      },
    });

    await this.sns.send(command);
  }

  async publish2(eventType: string, data: { countryISO: string }) {
    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: JSON.stringify(data),
      MessageAttributes: {
        countryISO: {
          DataType: 'String',
          StringValue: data.countryISO,
        },
        eventType: {
          DataType: 'String',
          StringValue: eventType,
        },
      },
    });
    await this.sns.send(command);
  }
}
