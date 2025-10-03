export interface DiveraAlarmRequest {
  title: string;
  text?: string;
  priority?: number;
  group?: number[];
  vehicle?: number[];
  foreign_id?: string;
  address?: string;
  lat?: number;
  lng?: number;
  alarm_date?: string;
  alarm_end?: string;
  ric?: string;
  keyword?: string;
  announcement?: boolean;
}

export interface DiveraAlarmResponse {
  success: boolean;
  alarm?: {
    id: number;
    title: string;
    text?: string;
    foreign_id?: string;
    created: string;
  };
  error?: string;
  message?: string;
}

export interface DiveraApiError {
  success: false;
  error: string;
  message?: string;
}
