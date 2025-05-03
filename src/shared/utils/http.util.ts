import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HttpUtil {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }
}
