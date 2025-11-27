import channels from "../channels/index.js";

export function validatePayload(payload) {
  if (!payload || typeof payload !== "object")
    throw new Error("Invalid payload");
  const { channel, to, body } = payload;
  if (!channel || !to || !body)
    throw new Error("channel, to and body required");
  const ch = channels[channel];
  if (!ch) throw new Error("unsupported channel");
  // channel-specific validation may throw
  ch.validate(payload);
}
