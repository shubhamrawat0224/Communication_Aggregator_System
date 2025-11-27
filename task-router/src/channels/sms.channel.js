export const name = "sms";

export function validate(payload) {
  if (
    !payload.to ||
    typeof payload.to !== "string" ||
    !/^\+?\d{7,15}$/.test(payload.to)
  ) {
    throw new Error("Invalid sms 'to' phone number");
  }
}
