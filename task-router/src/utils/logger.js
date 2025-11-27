import axios from "axios";
import { LOGGING_URL } from "../config/env.js";

// send structured log to logging service; fire-and-forget (best-effort)
export async function log(traceId, service, event, data = {}) {
  try {
    await axios.post(LOGGING_URL, {
      traceId,
      service,
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    // swallow: logging should not block main flow
    console.error("[logger] failed to send log", e.message);
  }
}
