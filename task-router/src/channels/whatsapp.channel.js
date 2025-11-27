export const name = "whatsapp";

export function validate(payload) {
  if (!payload.to || typeof payload.to !== "string") {
    throw new Error("Invalid whatsapp 'to' field");
  }
}
