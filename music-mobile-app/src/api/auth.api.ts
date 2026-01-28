import { apiClient, ApiErrorShape } from './client';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};

type SuccessEnvelope<T> = {
  status: 'success';
  data: T;
};

const mapAuthResponse = (res: SuccessEnvelope<{ id: string; email: string; username: string; token: string }>): AuthResult => {
  const { id, email, username, token } = res.data;
  return { token, user: { id, email, username } };
};

export const authApi = {
  async signup(payload: { email: string; password: string; username: string }): Promise<AuthResult> {
    try {
      const res = await apiClient.post<SuccessEnvelope<{ id: string; email: string; username: string; token: string }>>(
        '/v1/auth/signup',
        payload,
      );
      if (res.status !== 'success') {
        throw new Error('Signup failed');
      }
      return mapAuthResponse(res);
    } catch (e: any) {
      const err = e as ApiErrorShape;
      throw new Error(err.message || 'Signup failed');
    }
  },

  async login(payload: { email: string; password: string }): Promise<AuthResult> {
    try {
      const res = await apiClient.post<SuccessEnvelope<{ id: string; email: string; username: string; token: string }>>(
        '/v1/auth/login',
        payload,
      );
      if (res.status !== 'success') {
        throw new Error('Login failed');
      }
      return mapAuthResponse(res);
    } catch (e: any) {
      const err = e as ApiErrorShape;
      throw new Error(err.message || 'Login failed');
    }
  },
};
