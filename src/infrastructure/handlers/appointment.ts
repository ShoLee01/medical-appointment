import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  SQSEvent,
} from 'aws-lambda';
import { DynamoAppointmentRepository } from '../repositories/dynamodb/dynamodb-appointment.repository';
import { CreateAppointmentDto } from 'src/application/dto/create-appointment.dto';
import { AppointmentService } from 'src/application/services/appointment.service';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { AwsSnsPublisher } from '../messaging/aws/sns-publisher';

type LambdaEvent = APIGatewayProxyEvent | SQSEvent;

const isHttpEventPOST = (event: any): event is APIGatewayProxyEvent => {
  return event.requestContext?.http?.method === 'POST';
};

const isHttpEventGET = (event: any): event is APIGatewayProxyEvent => {
  return event.requestContext?.http?.method === 'GET';
};

const isSQSEvent = (event: any): event is SQSEvent => {
  return event.Records && event.Records[0]?.eventSource === 'aws:sqs';
};

// Configurar AWS SDK
const config = {
  region: process.env.AWS_REGION!,
};

// Inicializar clientes
const dynamoDBClient = new DynamoDBClient(config);
const dynamoDBDocument = DynamoDBDocument.from(dynamoDBClient);

// Obtener el nombre de la tabla de DynamoDB
const tableName = process.env.DYNAMODB_TABLE!;

export const handler = async (
  event: LambdaEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const snsPublisher = new AwsSnsPublisher();
    // Crear instancia del repositorio
    const repository = new DynamoAppointmentRepository(
      dynamoDBDocument,
      tableName,
    );
    const appointmentService = new AppointmentService(repository, snsPublisher);

    switch (true) {
      case isHttpEventPOST(event):
        return await handlePost(event, appointmentService);
      case isHttpEventGET(event):
        return await handleGet(event, appointmentService);
      case isSQSEvent(event):
        await handleSQS(event, appointmentService);
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'SQS messages processed' }),
        };
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        message: error.message || 'Internal Server Error',
      }),
    };
  }
};

// Procesar POST /appointments
async function handlePost(
  event: APIGatewayProxyEvent,
  service: AppointmentService,
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Request body is required' }),
    };
  }

  const dto: CreateAppointmentDto = JSON.parse(event.body);
  const appointment = await service.createAppointment(dto);

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: appointment.id,
      status: appointment.status,
      message: 'Appointment processing started',
    }),
  };
}

// Procesar GET /appointments?insuredId=...
async function handleGet(
  event: APIGatewayProxyEvent,
  service: AppointmentService,
): Promise<APIGatewayProxyResult> {
  console.log(event);
  const insuredId = event.queryStringParameters?.insuredId;

  await new Promise((resolve) => setTimeout(resolve, 1500));
  if (!insuredId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'insuredId query parameter is required',
      }),
    };
  }

  const appointments = await service.getByInsuredId(insuredId);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      appointments.map((appt) => ({
        id: appt.id,
        status: appt.status,
        scheduleId: appt.scheduleId,
        createdAt: appt.createdAt.toISOString(),
      })),
    ),
  };
}

// Procesar SQS
async function handleSQS(
  event: SQSEvent,
  service: AppointmentService,
): Promise<void> {
  for (const record of event.Records) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const message = JSON.parse(record.body);
      console.log('message', message);
      await service.handleProcessedAppointment(message.detail.appointmentId);
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  }
}
