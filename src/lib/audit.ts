import { prisma } from "@/lib/prisma";

/**
 * Append a tamper-evident record of a security-relevant action.
 * Never throws — auditing must not break the main flow.
 */
export async function audit(params: {
  userId?: string | null;
  action: string;
  resource?: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        resource: params.resource,
        ip: params.ip,
        userAgent: params.userAgent,
        meta: params.meta as object | undefined,
      },
    });
  } catch (err) {
    console.error("[audit] failed:", err);
  }
}
