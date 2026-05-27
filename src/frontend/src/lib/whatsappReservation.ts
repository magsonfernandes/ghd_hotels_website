import type { BookingRateSelection } from "../components/booking/bookingRates";
import type { RoomOccupancy } from "../components/booking/roomOccupancy";

export const WHATSAPP_BOOKING_PHONE = "918380008687";

function parseISODate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function hasValidBookingDates(checkIn: string, checkOut: string): boolean {
  const a = parseISODate(checkIn);
  const b = parseISODate(checkOut);
  return Boolean(a && b && b > a);
}

function formatStayDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseISODate(checkIn);
  const b = parseISODate(checkOut);
  if (!a || !b || b <= a) return 1;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function guestSummaryLine(rooms: RoomOccupancy[]): string {
  const adults = rooms.reduce((s, r) => s + r.adults, 0);
  const children = rooms.reduce((s, r) => s + r.children, 0);
  const parts = [
    `${rooms.length} room${rooms.length === 1 ? "" : "s"}`,
    `${adults} adult${adults === 1 ? "" : "s"}`,
  ];
  if (children > 0) {
    parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  }
  return parts.join(", ");
}

export type WhatsAppReservationInput = {
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rooms: RoomOccupancy[];
  roomAssignments: Array<{ categoryLabel: string }>;
  selection: BookingRateSelection;
};

export function buildReservationWhatsAppMessage(
  input: WhatsAppReservationInput,
): string {
  const checkInDate = parseISODate(input.checkIn);
  const checkOutDate = parseISODate(input.checkOut);
  const nights = nightsBetween(input.checkIn, input.checkOut);

  const checkInLabel = checkInDate
    ? formatStayDate(checkInDate)
    : input.checkIn;
  const checkOutLabel = checkOutDate
    ? formatStayDate(checkOutDate)
    : input.checkOut;

  const roomSummaryLines = input.selection.rooms
    .filter((r) => r.quantity > 0)
    .map((r) => `- ${r.quantity} x ${r.categoryLabel}`);

  const perRoomLines = input.roomAssignments.map((row, index) => {
    const occ = input.rooms[index];
    if (!occ) return `- Room ${index + 1}: ${row.categoryLabel}`;
    const guestBits = [
      `${occ.adults} adult${occ.adults === 1 ? "" : "s"}`,
    ];
    if (occ.children > 0) {
      guestBits.push(
        `${occ.children} child${occ.children === 1 ? "" : "ren"}`,
      );
    }
    return `- Room ${index + 1}: ${row.categoryLabel} (${guestBits.join(", ")})`;
  });

  const mealKeys = (
    [
      ["breakfast", "Breakfast"],
      ["lunch", "Lunch"],
      ["dinner", "Dinner"],
    ] as const
  )
    .filter(([key]) => input.selection.meals[key])
    .map(([, label]) => label);

  const lines = [
    "Hello GHD Hotels!",
    "",
    "I would love to make a reservation. Please find my details below:",
    "",
    `Property: ${input.hotelName}`,
    "",
    "Stay dates",
    `- Check-in: ${checkInLabel}`,
    `- Check-out: ${checkOutLabel}`,
    `- Duration: ${nights} night${nights === 1 ? "" : "s"}`,
    "",
    "Rooms requested",
    ...(roomSummaryLines.length
      ? roomSummaryLines
      : ["- (room selection pending)"]),
    "",
    "Guest breakdown",
    ...perRoomLines,
    `- Total: ${guestSummaryLine(input.rooms)}`,
  ];

  if (mealKeys.length > 0) {
    lines.push("", "Meal plan", `- ${mealKeys.join(", ")}`);
  }

  lines.push(
    "",
    "Kindly confirm availability and share the next steps. Thank you so much!",
  );

  return lines.join("\n");
}

export function buildReservationWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_BOOKING_PHONE}?text=${encodeURIComponent(message)}`;
}

export function openReservationWhatsApp(input: WhatsAppReservationInput): void {
  const message = buildReservationWhatsAppMessage(input);
  const url = buildReservationWhatsAppUrl(message);
  window.open(url, "_blank", "noopener,noreferrer");
}
