export const name = "email";

export function validate(payload) {
  if (
    !payload.to ||
    typeof payload.to !== "string" ||
    !payload.to.includes("@")
  ) {
    throw new Error("Invalid email 'to' address");
  }
}
