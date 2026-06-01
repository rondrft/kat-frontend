import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { apiConfig } from "@/config/api";
import { AppError } from "@/lib/errors";
import type { ApiErrorBody } from "@/types/api";

export type ApiClient = AxiosInstance;

function createApiClient(): ApiClient {
  const client = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: apiConfig.headers,
    withCredentials: true,
  });

  client.interceptors.request.use(onRequest, onRequestError);
  client.interceptors.response.use((res) => res, onResponseError);

  return client;
}

function onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("kat-access-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}

function onRequestError(error: unknown): Promise<never> {
  return Promise.reject(AppError.fromUnknown(error));
}

async function onResponseError(error: AxiosError<ApiErrorBody>): Promise<never> {
  const status = error.response?.status ?? 500;
  const body = error.response?.data;

  if (body?.message) {
    throw AppError.fromApiBody({
      status,
      error: body.error ?? "API_ERROR",
      message: body.message,
      path: body.path,
      errors: body.errors,
    });
  }

  if (error.code === "ECONNABORTED") {
    throw new AppError("La solicitud tardó demasiado", {
      status: 408,
      code: "TIMEOUT",
    });
  }

  if (!error.response) {
    throw new AppError("No se pudo conectar con el servidor", {
      status: 0,
      code: "NETWORK_ERROR",
    });
  }

  throw new AppError(error.message, { status, code: "HTTP_ERROR" });
}

export const apiClient = createApiClient();
