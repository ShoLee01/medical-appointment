import { Injectable } from '@nestjs/common';
import mysql from 'mysql2/promise';
import {
  Appointment,
  AppointmentStatus,
} from 'src/core/domain/appointment.entity';
import { IAppointmentRepository } from 'src/core/ports/appointment.repository';
import { RepositoryError } from 'src/core/exceptions';
import { CountryISO } from 'src/core/domain/value-objects/country-iso';
import { AppLogger } from 'src/shared/utils/logger.util';

@Injectable()
export class MysqlAppointmentRepository implements IAppointmentRepository {
  private pool: mysql.Pool;

  constructor(
    private readonly countryISO: string,
    private readonly logger: AppLogger = new AppLogger(),
  ) {
    if (this.countryISO !== 'PE' && this.countryISO !== 'CL') {
      throw new Error('Invalid countryISO. Only PE and CL are allowed.');
    }
    const dbConfig = {
      host: process.env.RDS_HOST,
      port: parseInt(process.env.RDS_PORT || '3306'),
      user: process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      database: process.env[`RDS_${countryISO}_DATABASE`],
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: { rejectUnauthorized: true },
    };
    this.pool = mysql.createPool(dbConfig);
  }

  async initializeTable(): Promise<void> {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS appointments (
          id VARCHAR(255) PRIMARY KEY,
          insuredId VARCHAR(5) NOT NULL,
          scheduleId INT NOT NULL,
          countryISO VARCHAR(2) NOT NULL,
          status VARCHAR(20) NOT NULL,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (error) {
      this.logger.log(`Appointment error: ${error}`, 'initializeTable');
      throw new RepositoryError(
        'Error initializing table',
        error instanceof Error ? error : undefined,
      );
    } finally {
      if (connection) connection.release();
    }
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    let connection;
    try {
      connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM appointments WHERE insuredId = ?',
        [insuredId],
      );
      return (rows as any[]).map((x) => this.toDomain(x));
    } catch (error) {
      throw new RepositoryError(
        'MySQL query failed',
        error instanceof Error ? error : undefined,
      );
    } finally {
      if (connection) connection.release();
    }
  }

  async updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
  ): Promise<void> {
    let connection;
    try {
      connection = await this.pool.getConnection();
      await connection.execute(
        'UPDATE appointments SET status = ?, updatedAt = NOW() WHERE id = ?',
        [status, appointmentId],
      );
    } catch (error) {
      throw new RepositoryError(
        'MySQL update failed',
        error instanceof Error ? error : undefined,
      );
    } finally {
      if (connection) connection.release();
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    let connection;
    try {
      connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM appointments WHERE id = ? LIMIT 1',
        [id],
      );
      const result = (rows as any[])[0];
      return result ? this.toDomain(result) : null;
    } catch (error) {
      throw new RepositoryError(
        'MySQL find failed',
        error instanceof Error ? error : undefined,
      );
    } finally {
      if (connection) connection.release();
    }
  }

  async save(appointment: Appointment): Promise<Appointment> {
    let connection;
    try {
      connection = await this.pool.getConnection();
      const entity = this.toEntity(appointment);
      await connection.execute(
        `INSERT INTO appointments 
         (id, insuredId, scheduleId, countryISO, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          entity.id,
          entity.insuredId,
          entity.scheduleId,
          entity.countryISO,
          entity.status,
          entity.createdAt,
          entity.updatedAt,
        ],
      );
      return appointment;
    } catch (error) {
      this.logger.log(`Appointment error: ${error}`, 'save');
      throw new RepositoryError(
        'MySQL save failed',
        error instanceof Error ? error : undefined,
      );
    } finally {
      if (connection) connection.release();
    }
  }

  private toEntity(appointment: Appointment): any {
    return {
      id: appointment.id,
      insuredId: appointment.insuredId,
      scheduleId: appointment.scheduleId,
      countryISO: appointment.countryISO.toString(),
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  private toDomain(row: any): Appointment {
    return new Appointment(
      row.id,
      row.insuredId,
      row.scheduleId,
      new CountryISO(row.countryISO),
      row.status as AppointmentStatus,
      row.createdAt,
      row.updatedAt,
    );
  }
}
