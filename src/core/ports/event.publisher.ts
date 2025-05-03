export interface EventPublisher {
  publish(eventType: string, data: any): Promise<void>;
}
