const guestFields = [
  "name",
  "attendance",
  "phone",
  "person_count",
  "side",
  "has_child",
  "song_request",
  "note",
];

const wishFields = ["name", "message", "audio_url"];

export const buildSubmitPayload = (
  type: "guest" | "wish",
  data: Record<string, unknown>,
  tenantId?: string | null,
) => {
  const fields = type === "guest" ? guestFields : wishFields;
  const payload = Object.fromEntries(
    fields
      .filter((field) => Object.prototype.hasOwnProperty.call(data, field))
      .map((field) => [field, data[field]]),
  ) as Record<string, unknown>;

  if (typeof tenantId === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(tenantId)) {
    payload.tenant_id = tenantId;
  }

  return payload;
};
