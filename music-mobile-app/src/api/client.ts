import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from './config';

export interface ApiErrorShape {
  message: string;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async get<T>(url: string, token?: string): Promise<T> {
    try {
      const res = await this.client.get<T>(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unknown error';
      throw { message, status } as ApiErrorShape;
    }
  }

  async post<T>(url: string, body: unknown, token?: string): Promise<T> {
    try {
      const res = await this.client.post<T>(url, body, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unknown error';
      throw { message, status } as ApiErrorShape;
    }
  }
}

export const apiClient = new ApiClient();
