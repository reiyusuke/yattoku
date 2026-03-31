import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminUser();

    const [
      totalEvents,
      publishedEvents,
      openEvents,
      totalApplications,
      recentEvents,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({
        where: {
          publishStatus: "published",
        },
      }),
      prisma.event.count({
        where: {
          applicationStatus: "open",
        },
      }),
      prisma.eventApplication.count(),
      prisma.event.findMany({
        orderBy: [
          { eventDate: "asc" },
          { id: "asc" },
        ],
        take: 5,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      summary: {
        totalEvents,
        publishedEvents,
        openEvents,
        totalApplications,
      },
      recentEvents: recentEvents.map((event) => ({
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
