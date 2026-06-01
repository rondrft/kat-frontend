import type { ApiErrorBody } from "@/types/api";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      details?: Record<string, string[]>;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.status = options.status ?? 500;
    this.code = options.code ?? "UNKNOWN_ERROR";
    this.details = options.details;
  }

  static fromApiBody(body: ApiErrorBody): AppError {
    return new AppError(body.message || body.error, {
      status: body.status,
      code: body.error,
      details: body.errors,
    });
  }

  static fromUnknown(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error) {
      return new AppError(error.message, { code: "CLIENT_ERROR", cause: error });
    }
    return new AppError("Ha ocurrido un error inesperado", { code: "UNKNOWN_ERROR" });
  }
}

export function getErrorMessage(error: unknown): string {
  return AppError.fromUnknown(error).message;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof AppError && error.status === 401;
}
