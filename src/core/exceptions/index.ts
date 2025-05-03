export class AppointmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Appointment with id ${id} not found`);
    this.name = 'AppointmentNotFoundError';
  }
}

export class InvalidAppointmentStatusError extends Error {
  constructor(currentStatus: string) {
    super(`Invalid appointment status transition from ${currentStatus}`);
    this.name = 'InvalidAppointmentStatusError';
  }
}

export class RepositoryError extends Error {
  constructor(message: string, originalError?: Error) {
    super(`${message}: ${originalError?.message}`);
    this.name = 'RepositoryError';
    this.stack = originalError?.stack;
  }
}
