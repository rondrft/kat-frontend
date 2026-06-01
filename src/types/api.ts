export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
  timestamp?: string;
};

export type ApiErrorBody = {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
};
