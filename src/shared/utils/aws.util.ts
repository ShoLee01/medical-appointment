import { EventBridge } from '@aws-sdk/client-eventbridge';
import { SNS } from '@aws-sdk/client-sns';
import { SQS } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsUtil {
  constructor(private readonly configService: ConfigService) {}

  getSNSClient(): SNS {
    return new SNS({
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  getSQSClient(): SQS {
    return new SQS({
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  getEventBridgeClient(): EventBridge {
    return new EventBridge({
      region: this.configService.get<string>('AWS_REGION'),
    });
  }
}
