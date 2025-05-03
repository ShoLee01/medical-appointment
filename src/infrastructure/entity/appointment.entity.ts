import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AppointmentEntity {
  @PrimaryColumn()
  id: string;

  @Column({ length: 5 })
  insuredId: string;

  @Column()
  scheduleId: number;

  @Column({ length: 2 })
  countryISO: string;

  @Column({ length: 20 })
  status: string;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}
