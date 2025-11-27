import axios from "axios";
import { LOGGING_URL } from "../config/env.js";

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
    console.error("[delivery logger] failed", e.message);
  }
}
