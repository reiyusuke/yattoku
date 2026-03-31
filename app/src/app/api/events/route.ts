import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() ?? "";
    const onlyOpen = searchParams.get("onlyOpen") === "1";
    const sort = searchParams.get("sort")?.trim() ?? "eventDateAsc";

    const orderBy =
      sort === "createdAtDesc"
        ? [{ createdAt: "desc" as const }, { id: "desc" as const }]
        : [{ eventDate: "asc" as const }, { id: "asc" as const }];

    const events = await prisma.event.findMany({
      where: {
        publishStatus: "published",
        ...(onlyOpen
          ? {
              applicationStatus: "open",
            }
          : {}),
        ...(q.length > 0
          ? {
              OR: [
                {
                  title: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  place: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      orderBy,
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
