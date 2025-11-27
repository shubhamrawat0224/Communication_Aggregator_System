import { getMessage, incrementAttempts, getAttempts } from "./dedup.store.js";
import { publishMessage } from "./eventBus.js";
import { log } from "../utils/logger.js";

const MAX_RETRIES = 3;

export async function handleStatus(status) {
  const { messageId, success, detail } = status;
  if (success) {
    await log(messageId, "task-router", "delivery_success", { detail });
    return;
  }

  const attempts = await incrementAttempts(messageId);
  if (attempts <= MAX_RETRIES) {
    const original = await getMessage(messageId);
    if (!original) {
      await log(messageId, "task-router", "missing_original_on_retry", {});
      return;
    }
    // re-publish with updated meta
    const repub = {
      ...original.payload,
      meta: { attempts },
    };
    await publishMessage(original.payload.channel, repub);
    await log(messageId, "task-router", "retry_published", { attempts });
  } else {
    await log(messageId, "task-router", "failed_after_retries", { attempts });
  }
}
