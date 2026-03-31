import "dotenv/config";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "yattoku_session";

export const authConfig = {
  sessionCookieName: SESSION_COOKIE_NAME,
  sessionMaxAgeSeconds: 60 * 60 * 24 * 7,
};

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: bigint) {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + authConfig.sessionMaxAgeSeconds * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
    },
  });

  return session;
}

export async function setSessionCookie(sessionToken: string, expiresAt: Date) {
  const cookieStore = await cookies();

  cookieStore.set(authConfig.sessionCookieName, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(authConfig.sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getSessionTokenFromCookie() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(authConfig.sessionCookieName);

  return cookie?.value ?? null;
}

export async function getCurrentSession() {
  const sessionToken = await getSessionTokenFromCookie();

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({
      where: {
        sessionToken,
      },
    });

    await clearSessionCookie();
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("unauthorized");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (user.role !== "admin") {
    throw new Error("forbidden");
  }

  return user;
}

export async function deleteSessionByToken(sessionToken: string) {
  await prisma.session.deleteMany({
    where: {
      sessionToken,
    },
  });
}
