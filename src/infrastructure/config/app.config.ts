import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  awsRegion: process.env.AWS_REGION,
  dynamodbTable: process.env.DYNAMODB_TABLE,
  snsTopicArn: process.env.SNS_TOPIC_ARN,
  eventBusName: process.env.EVENT_BUS_NAME,
  sqsPeUrl: process.env.SQS_PE_URL,
  sqsClUrl: process.env.SQS_CL_URL,
}));
