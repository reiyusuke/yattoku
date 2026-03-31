import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminUser();

    const events = await prisma.event.findMany({
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
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

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdminUser();

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_request_body",
        },
        { status: 400 }
      );
    }

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const place =
      typeof body.place === "string" ? body.place.trim() : "";
    const publishStatus =
      typeof body.publishStatus === "string" ? body.publishStatus.trim() : "";
    const applicationStatus =
      typeof body.applicationStatus === "string"
        ? body.applicationStatus.trim()
        : "";
    const eventDateRaw =
      typeof body.eventDate === "string" ? body.eventDate.trim() : "";

    if (title.length === 0) {
      return NextResponse.json(
        { ok: false, error: "title_required" },
        { status: 400 }
      );
    }

    if (description.length === 0) {
      return NextResponse.json(
        { ok: false, error: "description_required" },
        { status: 400 }
      );
    }

    if (place.length === 0) {
      return NextResponse.json(
        { ok: false, error: "place_required" },
        { status: 400 }
      );
    }

    if (eventDateRaw.length === 0) {
      return NextResponse.json(
        { ok: false, error: "event_date_required" },
        { status: 400 }
      );
    }

    const eventDate = new Date(eventDateRaw);

    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { ok: false, error: "invalid_event_date" },
        { status: 400 }
      );
    }

    const allowedPublishStatuses = ["draft", "published", "private"];
    const allowedApplicationStatuses = ["open", "closed"];

    if (!allowedPublishStatuses.includes(publishStatus)) {
      return NextResponse.json(
        { ok: false, error: "invalid_publish_status" },
        { status: 400 }
      );
    }

    if (!allowedApplicationStatuses.includes(applicationStatus)) {
      return NextResponse.json(
        { ok: false, error: "invalid_application_status" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate,
        place,
        publishStatus,
        applicationStatus,
        createdBy: adminUser.id,
      },
    });

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
