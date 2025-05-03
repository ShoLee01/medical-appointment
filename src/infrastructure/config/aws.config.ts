import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class AwsConfigService {
  private readonly dynamoDBClient: DynamoDBClient;

  constructor(private configService: ConfigService) {
    this.dynamoDBClient = new DynamoDBClient({
      region: configService.get<string>('AWS_REGION') || 'us-east-1',
    });
  }

  getDynamoDBDocument(): DynamoDBDocument {
    return DynamoDBDocument.from(this.dynamoDBClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
  }

  getSNSConfig() {
    return {
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
    };
  }
}
