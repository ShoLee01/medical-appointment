import { Inject, Injectable } from '@nestjs/common';
import {
  DynamoDBDocument,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  Appointment,
  AppointmentStatus,
} from 'src/core/domain/appointment.entity';
import { IAppointmentRepository } from 'src/core/ports/appointment.repository';
import { RepositoryError } from 'src/core/exceptions';
import { CountryISO } from 'src/core/domain/value-objects/country-iso';
import { DYNAMODB_TABLE } from './dynamodb.providers';

interface DynamoAppointmentItem {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DynamoAppointmentRepository implements IAppointmentRepository {
  constructor(
    @Inject(DynamoDBDocument) private readonly dynamoDB: DynamoDBDocument,
    @Inject(DYNAMODB_TABLE) private readonly tableName: string,
  ) {}

  async updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
  ): Promise<void> {
    try {
      await this.dynamoDB.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { id: appointmentId },
          UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':status': status,
            ':updatedAt': new Date().toISOString(),
          },
        }),
      );
    } catch (error) {
      throw new RepositoryError(
        'DynamoDB update failed',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      const { Item } = await this.dynamoDB.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id },
        }),
      );

      return Item ? this.toEntity(Item as DynamoAppointmentItem) : null;
    } catch (error) {
      throw new RepositoryError(
        'DynamoDB find failed',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async save(appointment: Appointment): Promise<Appointment> {
    try {
      await this.dynamoDB.send(
        new PutCommand({
          TableName: this.tableName,
          Item: this.toItem(appointment),
        }),
      );
      return appointment;
    } catch (error) {
      throw new RepositoryError(
        'DynamoDB save failed',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    try {
      const { Items } = await this.dynamoDB.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'InsuredIdIndex',
          KeyConditionExpression: 'insuredId = :id',
          ExpressionAttributeValues: { ':id': insuredId },
        }),
      );

      return ((Items as DynamoAppointmentItem[]) || []).map((x) =>
        this.toEntity(x),
      );
    } catch (error) {
      throw new RepositoryError(
        'DynamoDB query failed',
        error instanceof Error ? error : undefined,
      );
    }
  }

  private toItem(appointment: Appointment): DynamoAppointmentItem {
    return {
      id: appointment.id,
      insuredId: appointment.insuredId,
      scheduleId: appointment.scheduleId,
      countryISO: appointment.countryISO.toString(),
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };
  }

  private toEntity(item: DynamoAppointmentItem): Appointment {
    return new Appointment(
      item.id,
      item.insuredId,
      item.scheduleId,
      new CountryISO(item.countryISO),
      item.status,
      new Date(item.createdAt),
      new Date(item.updatedAt),
    );
  }
}
