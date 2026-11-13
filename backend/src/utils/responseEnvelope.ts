import { Response } from 'express';
import { ErrorCode, ErrorDetail } from '../errors/AppError.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetail[];
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: PaginationMeta,
  statusCode: number = 200
): Response {
  const envelope: SuccessEnvelope<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(envelope);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: ErrorDetail[]
): Response {
  const envelope: ErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 && { details }),
    },
  };
  return res.status(statusCode).json(envelope);
}

