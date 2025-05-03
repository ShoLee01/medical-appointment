import { Injectable } from '@nestjs/common';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { EventPublisher } from 'src/core/ports/event.publisher';
import { AppLogger } from 'src/shared/utils/logger.util';

@Injectable()
export class EventBridgePublisher implements EventPublisher {
  private eventBridge: EventBridgeClient;

  constructor(private readonly logger: AppLogger = new AppLogger()) {
    this.eventBridge = new EventBridgeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async publish(eventType: string, data: any): Promise<void> {
    const params = {
      Entries: [
        {
          Source: 'appointments',
          DetailType: eventType,
          Detail: JSON.stringify(data),
          EventBusName: process.env.EVENT_BUS,
        },
      ],
    };

    try {
      const command = new PutEventsCommand(params);
      const response = await this.eventBridge.send(command);
      this.logger.log(`Event published: ${eventType}`, data);

      if (response.FailedEntryCount && response.FailedEntryCount > 0) {
        throw new Error(
          `Failed to publish event: ${JSON.stringify(response.Entries)}`,
        );
      }
    } catch (error) {
      this.logger.error('Error publishing event', error);
      throw new Error(`EventBridge publish failed: ${error.message}`);
    }
  }

  async publishAppointmentProcessed(
    appointmentId: string,
    countryISO: string,
  ): Promise<void> {
    await this.publish('AppointmentProcessed', {
      appointmentId,
      countryISO,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  }
}
