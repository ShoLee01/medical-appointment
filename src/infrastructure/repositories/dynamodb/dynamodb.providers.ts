import { Provider } from '@nestjs/common';

export const DYNAMODB_TABLE = 'DYNAMODB_TABLE';

export const dynamoDBTableProvider: Provider = {
  provide: DYNAMODB_TABLE,
  useFactory: () => {
    const tableName = process.env.DYNAMODB_TABLE;
    if (!tableName) {
      throw new Error('DYNAMODB_TABLE no está definido en process.env');
    }
    return tableName;
  },
};
