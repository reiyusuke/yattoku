import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  deleteSessionByToken,
  getSessionTokenFromCookie,
} from "@/lib/auth";

export async function POST() {
  try {
    const sessionToken = await getSessionTokenFromCookie();

    if (sessionToken) {
      await deleteSessionByToken(sessionToken);
    }

    await clearSessionCookie();

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: false, error: "internal_server_error" },
      { status: 500 }
    );
  }
}
