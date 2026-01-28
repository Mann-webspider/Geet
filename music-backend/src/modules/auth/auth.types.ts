export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  token: string;
}
