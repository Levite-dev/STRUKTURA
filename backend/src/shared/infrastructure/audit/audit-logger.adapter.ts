import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuditLogEntry,
  AuditLoggerPort,
} from '../../application/ports/audit-logger.port';

function toJson(
  value: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value == null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

@Injectable()
export class AuditLoggerAdapter implements AuditLoggerPort {
  private readonly logger = new Logger(AuditLoggerAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorUserId: entry.actorUserId ?? null,
          actorRole: entry.actorRole ?? null,
          action: entry.action,
          entityType: entry.entityType ?? null,
          entityId: entry.entityId ?? null,
          oldValues: toJson(entry.oldValues),
          newValues: toJson(entry.newValues),
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
          traceId: entry.traceId ?? null,
          metadata: toJson(entry.metadata),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        { error: message, action: entry.action },
        'Failed to write audit log',
      );
    }
  }
}
