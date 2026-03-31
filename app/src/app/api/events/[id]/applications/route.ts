import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          ok: false,
          error: "unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_event_id",
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body.inputName !== "string") {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_request_body",
        },
        { status: 400 }
      );
    }

    const inputName = body.inputName.trim();

    if (inputName.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "input_name_required",
        },
        { status: 400 }
      );
    }

    if (inputName.length > 100) {
      return NextResponse.json(
        {
          ok: false,
          error: "input_name_too_long",
        },
        { status: 400 }
      );
    }

    const eventId = BigInt(id);

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        publishStatus: "published",
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          ok: false,
          error: "event_not_found",
        },
        { status: 404 }
      );
    }

    if (event.applicationStatus !== "open") {
      return NextResponse.json(
        {
          ok: false,
          error: "application_closed",
        },
        { status: 400 }
      );
    }

    const existingApplication = await prisma.eventApplication.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUser.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          ok: false,
          error: "already_applied",
        },
        { status: 409 }
      );
    }

    const application = await prisma.eventApplication.create({
      data: {
        eventId,
        userId: currentUser.id,
        inputName,
        status: "applied",
      },
    });

    return NextResponse.json({
      ok: true,
      application: {
        id: application.id.toString(),
        eventId: application.eventId.toString(),
        userId: application.userId.toString(),
        inputName: application.inputName,
        status: application.status,
        appliedAt: application.appliedAt,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: "internal_server_error",
      },
      { status: 500 }
    );
  }
}
