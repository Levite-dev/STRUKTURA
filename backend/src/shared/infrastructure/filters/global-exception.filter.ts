import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  DomainException,
  NotFoundException as DomainNotFound,
  ConflictException as DomainConflict,
  UnauthorizedException as DomainUnauthorized,
  ForbiddenException as DomainForbidden,
  ValidationException as DomainValidation,
  BadRequestException as DomainBadRequest,
} from '../../domain/exceptions';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  traceId: string;
  errors?: Record<string, string[]>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const traceId = (req.headers['x-trace-id'] as string) ?? randomUUID();

    const problem = this.map(exception, traceId);

    if (problem.status >= 500) {
      this.logger.error(
        { traceId, path: req.url, method: req.method, exception },
        `5xx: ${problem.title}`,
      );
    } else {
      this.logger.warn(
        { traceId, path: req.url, method: req.method, code: problem.title },
        `${problem.status}: ${problem.detail}`,
      );
    }

    res
      .status(problem.status)
      .header('Content-Type', 'application/problem+json')
      .json(problem);
  }

  private map(exception: unknown, traceId: string): ProblemDetails {
    // Domain exceptions
    if (exception instanceof DomainNotFound) {
      return this.build(
        HttpStatus.NOT_FOUND,
        exception.code,
        exception.message,
        traceId,
      );
    }
    if (exception instanceof DomainConflict) {
      return this.build(
        HttpStatus.CONFLICT,
        exception.code,
        exception.message,
        traceId,
      );
    }
    if (exception instanceof DomainUnauthorized) {
      return this.build(
        HttpStatus.UNAUTHORIZED,
        exception.code,
        exception.message,
        traceId,
      );
    }
    if (exception instanceof DomainForbidden) {
      return this.build(
        HttpStatus.FORBIDDEN,
        exception.code,
        exception.message,
        traceId,
      );
    }
    if (exception instanceof DomainValidation) {
      const p = this.build(
        HttpStatus.BAD_REQUEST,
        exception.code,
        exception.message,
        traceId,
      );
      p.errors = exception.errors;
      return p;
    }
    if (exception instanceof DomainBadRequest) {
      return this.build(
        HttpStatus.BAD_REQUEST,
        exception.code,
        exception.message,
        traceId,
      );
    }
    if (exception instanceof DomainException) {
      return this.build(
        HttpStatus.BAD_REQUEST,
        exception.code,
        exception.message,
        traceId,
      );
    }

    // NestJS HttpException (validation pipe, throttler, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const responseObj =
        typeof response === 'object' && response !== null
          ? (response as { message?: string | string[] })
          : null;
      const detail =
        typeof response === 'string'
          ? response
          : (responseObj?.message ?? exception.message);
      const errors =
        responseObj && Array.isArray(responseObj.message)
          ? this.flattenClassValidator(responseObj.message)
          : undefined;
      const p = this.build(
        status,
        this.codeForStatus(status),
        Array.isArray(detail) ? detail.join('; ') : detail,
        traceId,
      );
      if (errors) p.errors = errors;
      return p;
    }

    // Prisma unique constraint → 409
    if (this.isPrismaUniqueViolation(exception)) {
      return this.build(
        HttpStatus.CONFLICT,
        'CONFLICT',
        'A resource with the provided unique field already exists.',
        traceId,
      );
    }

    // Fallback 500
    return this.build(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred.',
      traceId,
    );
  }

  private build(
    status: number,
    code: string,
    detail: string,
    traceId: string,
  ): ProblemDetails {
    return {
      type: `https://httpstatuses.com/${status}`,
      title: code,
      status,
      detail,
      traceId,
    };
  }

  private codeForStatus(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'RESOURCE_NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'UNPROCESSABLE_ENTITY';
      case 429:
        return 'TOO_MANY_REQUESTS';
      default:
        return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST';
    }
  }

  private flattenClassValidator(messages: string[]): Record<string, string[]> {
    // class-validator returns flat strings — we group them under "_" by default.
    return { _: messages };
  }

  private isPrismaUniqueViolation(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code?: string }).code === 'P2002'
    );
  }
}
