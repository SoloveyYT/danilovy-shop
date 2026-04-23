import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/** Запись в журнал админки; ошибки не прерывают основной запрос. */
export async function writeAdminLog(
  user: { id: string; email: string },
  action: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        userId: user.id,
        email: user.email,
        action,
        meta: meta !== undefined ? (meta as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch {
    /* игнорируем сбои логирования */
  }
}
