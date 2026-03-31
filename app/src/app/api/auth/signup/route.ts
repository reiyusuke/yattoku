import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

function getEmailDomain(email: string) {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return null;
  return email.slice(atIndex + 1).toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "invalid_request_body" },
        { status: 400 }
      );
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const nickname =
      typeof body.nickname === "string" ? body.nickname.trim() : "";

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "email_required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { ok: false, error: "password_required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "password_too_short" },
        { status: 400 }
      );
    }

    const emailDomain = getEmailDomain(email);

    if (!emailDomain) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 }
      );
    }

    const allowedDomain = await prisma.allowedEmailDomain.findFirst({
      where: {
        domain: emailDomain,
        isActive: true,
      },
    });

    if (!allowedDomain) {
      return NextResponse.json(
        { ok: false, error: "email_domain_not_allowed" },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: "email_already_exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname: nickname || null,
        role: "student",
        emailVerified: true,
      },
    });

    const session = await createSession(user.id);
    await setSessionCookie(session.sessionToken, session.expiresAt);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: false, error: "internal_server_error" },
      { status: 500 }
    );
  }
}
