import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
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

    return NextResponse.json({
      ok: true,
      event: {
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        place: event.place,
        publishStatus: event.publishStatus,
        applicationStatus: event.applicationStatus,
        createdBy: event.createdBy.toString(),
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
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
