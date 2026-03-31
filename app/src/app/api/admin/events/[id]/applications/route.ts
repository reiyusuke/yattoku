import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdminUser();

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

    const eventId = BigInt(id);

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
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

    const applications = await prisma.eventApplication.findMany({
      where: {
        eventId,
      },
      include: {
        user: true,
      },
      orderBy: [
        { appliedAt: "asc" },
        { id: "asc" },
      ],
    });

    return NextResponse.json({
      ok: true,
      event: {
        id: event.id.toString(),
        title: event.title,
        publishStatus: event.publishStatus,
        applicationStatus: event.applicationStatus,
      },
      applications: applications.map((application) => ({
        id: application.id.toString(),
        eventId: application.eventId.toString(),
        userId: application.userId.toString(),
        inputName: application.inputName,
        status: application.status,
        appliedAt: application.appliedAt,
        user: {
          id: application.user.id.toString(),
          email: application.user.email,
          nickname: application.user.nickname,
          role: application.user.role,
          emailVerified: application.user.emailVerified,
        },
      })),
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "unauthorized") {
        return NextResponse.json(
          { ok: false, error: "unauthorized" },
          { status: 401 }
        );
      }

      if (error.message === "forbidden") {
        return NextResponse.json(
          { ok: false, error: "forbidden" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { ok: false, error: "internal_server_error" },
      { status: 500 }
    );
  }
}
