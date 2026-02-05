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
      console.log(payload);
      
      const res = await apiClient.post(
        '/v1/auth/login',
        payload,
      );
      console.log(res);
      
      if (res.status !== 'success') {
        throw new Error('Login failed');
      }
      return mapAuthResponse(res);
    } catch (e: any) {
      const err = e as ApiErrorShape;
      console.log(err);
      
      throw new Error(err.message || 'Login failed');
    }
  },
  // auth.api.ts
async getMe(token: string): Promise<AuthUser> {
  try {
    const res = await apiClient.get<SuccessEnvelope<AuthUserEnvelope>>(
      '/v1/auth/me',
      token,
    );
    if (res.status !== 'success') throw new Error('Unauthorized');
    return res.data;
  } catch (e: any) {
    const err = e as ApiErrorShape & { status?: number };
    if (err.status === 401 || err.status === 404) {
      // treat user-not-found as invalid session
      throw { type: 'unauthorized', message: err.message || 'Unauthorized' } as const;
    }
    throw { type: 'error', message: err.message || 'Failed to load session' } as const;
  }
}

};
