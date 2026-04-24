 "use client";

import { useState } from "react";
import { RequireRole } from "@/components/dashboard/RequireRole";
import { EventCard } from "@/components/events/EventCard";
import { type EventStatus, type EventSummary } from "@/lib/events";
import {
  useCancelEventMutation,
  useCreateEventMutation,
  useListEventsQuery,
  usePublishEventMutation,
  useUpdateEventMutation,
  type EventApiError,
} from "@/store/api";

export default function DashboardEventsPage() {
  const { data: events = [], isLoading, isError } = useListEventsQuery();
  const [createEvent, { isLoading: creating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updating }] = useUpdateEventMutation();
  const [publishEvent, { isLoading: publishing }] = usePublishEventMutation();
  const [cancelEvent, { isLoading: cancelling }] = useCancelEventMutation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [category, setCategory] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<EventStatus>("DRAFT");

  function toDateTimeLocalInput(value?: string) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value.slice(0, 16);
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setVenue("");
    setCity("");
    setEventDateTime("");
    setCategory("");
    setImageDataUrl("");
    setImageName("");
    setImageFile(null);
    setStatus("DRAFT");
  }

  function handleImageFileChange(file: File | null) {
    if (!file) {
      setImageDataUrl("");
      setImageName("");
      return;
    }

    setImageName(file.name);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function toErrorMessage(error: unknown, fallback: string) {
    const candidate = error as EventApiError;
    if (typeof candidate?.data === "object" && candidate.data) {
      const message = (candidate.data as { message?: string }).message;
      if (message) return message;
    }
    if ("status" in (candidate ?? {}) && (candidate as { status?: number }).status === 403) {
      return "You do not have permission for this action.";
    }
    return fallback;
  }

  async function handleAddEvent() {
    if (!title.trim()) return;
    setApiError(null);
    const eventPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      venue: venue.trim() || undefined,
      city: city.trim() || undefined,
      eventDateTime: eventDateTime ? new Date(eventDateTime).toISOString() : undefined,
      organizerName: "Phoenix Org",
      category: category.trim() || undefined,
      bannerUrl: imageDataUrl?.startsWith("http") ? imageDataUrl : undefined,
      banner: imageFile,
    };
    try {
      if (editingEventId) {
        await updateEvent({
          eventId: editingEventId,
          ...eventPayload,
        }).unwrap();
      } else {
        await createEvent({
          title: eventPayload.title,
          venue: eventPayload.venue ?? "",
          city: eventPayload.city ?? "",
          eventDateTime: eventPayload.eventDateTime ?? "",
          organizerName: eventPayload.organizerName ?? "",
          category: eventPayload.category ?? "",
          description: eventPayload.description,
          bannerUrl: eventPayload.bannerUrl,
          banner: eventPayload.banner,
        }).unwrap();
      }
      if (editingEventId && status !== "DRAFT") {
        if (status === "PUBLISHED") {
          await publishEvent(editingEventId).unwrap();
        } else if (status === "CANCELLED") {
          await cancelEvent(editingEventId).unwrap();
        }
      }
      setIsAddOpen(false);
      setEditingEventId(null);
      resetForm();
    } catch (error) {
      setApiError(toErrorMessage(error, "Could not save event. Please try again."));
    }
  }

  function openAddModal() {
    setEditingEventId(null);
    resetForm();
    setIsAddOpen(true);
  }

  function openEditModal(event: EventSummary) {
    setEditingEventId(event.eventId);
    setTitle(event.title ?? "");
    setDescription(event.description ?? "");
    setVenue(event.venue ?? "");
    setCity(event.city ?? "");
    setEventDateTime(toDateTimeLocalInput(event.eventDateTime));
    setCategory(event.category ?? "");
    setImageDataUrl(event.bannerUrl ?? "");
    setImageName("");
    setStatus(event.status);
    setIsAddOpen(true);
  }

  return (
    <RequireRole tab="events">
      <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Events
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Connected to Event Service.
            </p>
            {isError ? <p className="mt-1 text-xs text-red-600">Failed to load events.</p> : null}
            {apiError ? <p className="mt-1 text-xs text-red-600">{apiError}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {events.length} total
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Add event
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Loading events...
          </div>
        ) : null}
        {events.map((event) => (
          <EventCard
            key={event.eventId}
            event={event}
            variant="list"
            onEdit={() => openEditModal(event)}
            onStatusChange={async (nextStatus) => {
              try {
                setApiError(null);
                if (nextStatus === "PUBLISHED") {
                  await publishEvent(event.eventId).unwrap();
                } else if (nextStatus === "CANCELLED") {
                  await cancelEvent(event.eventId).unwrap();
                }
              } catch (error) {
                setApiError(toErrorMessage(error, "Could not change event status."));
              }
            }}
          />
        ))}
      </div>

      {isAddOpen ? (
        <>
          <button
            type="button"
            aria-label="Close add event modal"
            className="fixed inset-0 z-40 cursor-default bg-black/30"
            onClick={() => setIsAddOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(860px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {editingEventId ? "Update event" : "Add event"}
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Venue
                </span>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  City
                </span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Event date time
                </span>
                <input
                  type="datetime-local"
                  value={eventDateTime}
                  onChange={(e) => setEventDateTime(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Category
                </span>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:file:bg-zinc-50 dark:file:text-zinc-950"
                />
                {imageName ? (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Selected: {imageName}
                  </p>
                ) : null}
                {imageDataUrl ? (
                  <div className="mt-2 h-24 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                    <img
                      src={imageDataUrl}
                      alt="Selected event image preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingEventId(null);
                  resetForm();
                }}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEvent}
                disabled={creating || updating || publishing || cancelling}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {creating || updating || publishing || cancelling
                  ? "Saving..."
                  : editingEventId
                    ? "Update event"
                    : "Add event"}
              </button>
            </div>
          </div>
        </>
      ) : null}
      </div>
    </RequireRole>
  );
}
