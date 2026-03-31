import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const eventId = BigInt(id);

    const existingEvent = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        {
          ok: false,
          error: "event_not_found",
        },
        { status: 404 }
      );
    }

    const data: {
      title?: string;
      description?: string;
      place?: string;
      eventDate?: Date;
      publishStatus?: string;
      applicationStatus?: string;
    } = {};

    if ("title" in body) {
      if (typeof body.title !== "string") {
        return NextResponse.json(
          { ok: false, error: "invalid_title" },
          { status: 400 }
        );
      }

      const title = body.title.trim();

      if (title.length === 0) {
        return NextResponse.json(
          { ok: false, error: "title_required" },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if ("description" in body) {
      if (typeof body.description !== "string") {
        return NextResponse.json(
          { ok: false, error: "invalid_description" },
          { status: 400 }
        );
      }

      const description = body.description.trim();

      if (description.length === 0) {
        return NextResponse.json(
          { ok: false, error: "description_required" },
          { status: 400 }
        );
      }

      data.description = description;
    }

    if ("place" in body) {
      if (typeof body.place !== "string") {
        return NextResponse.json(
          { ok: false, error: "invalid_place" },
          { status: 400 }
        );
      }

      const place = body.place.trim();

      if (place.length === 0) {
        return NextResponse.json(
          { ok: false, error: "place_required" },
          { status: 400 }
        );
      }

      data.place = place;
    }

    if ("eventDate" in body) {
      if (typeof body.eventDate !== "string") {
        return NextResponse.json(
          { ok: false, error: "invalid_event_date" },
          { status: 400 }
        );
      }

      const eventDateRaw = body.eventDate.trim();

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

      data.eventDate = eventDate;
    }

    if ("publishStatus" in body) {
      if (typeof body.publishStatus !== "string") {
        return NextResponse.json(
          { ok: false, error: "invalid_publish_status" },
          { status: 400 }
        );
      }

      const publishStatus = body.publishStatus.trim();
      const allowedPublishStatuses = ["draft", "published", "private"];

      if (!allowedPublishStatuses.includes(publishStatus)) {
        return NextResponse.json(
          { ok: false, error: "invalid_publish_status" },
          { status: 400 }
        );
      }

      data.publishStatus = publishStatus;
    }

    if ("applicationStatus" in body) {
      if (typeof body.applicationStatus !== "string") {
        return NextResponse.json(
          { ok: false, error: "invalid_application_status" },
          { status: 400 }
        );
      }

      const applicationStatus = body.applicationStatus.trim();
      const allowedApplicationStatuses = ["open", "closed"];

      if (!allowedApplicationStatuses.includes(applicationStatus)) {
        return NextResponse.json(
          { ok: false, error: "invalid_application_status" },
          { status: 400 }
        );
      }

      data.applicationStatus = applicationStatus;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { ok: false, error: "no_update_fields" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data,
    });

    return NextResponse.json({
      ok: true,
      event: {
        id: updatedEvent.id.toString(),
        title: updatedEvent.title,
        description: updatedEvent.description,
        eventDate: updatedEvent.eventDate,
        place: updatedEvent.place,
        publishStatus: updatedEvent.publishStatus,
        applicationStatus: updatedEvent.applicationStatus,
        createdBy: updatedEvent.createdBy.toString(),
        createdAt: updatedEvent.createdAt,
        updatedAt: updatedEvent.updatedAt,
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
