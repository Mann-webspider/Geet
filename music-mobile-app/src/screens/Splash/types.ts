export interface HealthResponse {
  status: string;
  timestamp: number;
}

export interface AppConfigResponse {
  apiVersion: string;
  minSupportedAppVersion: string;
  features: Record<string, boolean>;
}
