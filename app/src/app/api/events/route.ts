import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        publishStatus: "published",
      },
      orderBy: [
        { eventDate: "asc" },
        { id: "asc" },
      ],
    });

    return NextResponse.json({
      ok: true,
      events: events.map((event) => ({
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
      })),
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
