import express from "express";
import bodyParser from "body-parser";
import { PORT } from "./config/env.js";
import channels from "./channels/index.js";
import {
  initEventBus,
  assertAndConsume,
  publishStatus,
} from "./core/eventBus.js";
import { saveDelivery } from "./core/message.store.js";
import { log } from "./utils/logger.js";

await initEventBus();

async function startConsumers() {
  for (const channelName of Object.keys(channels)) {
    const queueName = `${channelName}_queue`;
    await assertAndConsume(queueName, channelName, async (message) => {
      const traceId = message.id;
      await log(traceId, "delivery-service", "consumed", {
        channel: channelName,
        message,
      });
      const sender = channels[channelName];
      if (!sender) {
        await log(traceId, "delivery-service", "no_sender", { channelName });
        publishStatus(`status.${traceId}`, {
          messageId: traceId,
          success: false,
          detail: "no_sender",
        });
        return;
      }
      let success = false;
      try {
        success = await sender.send(message);
      } catch (e) {
        success = false;
      }
      await saveDelivery({
        id: traceId,
        channel: channelName,
        to: message.to,
        body: message.body,
        success,
        timestamp: new Date().toISOString(),
      });
      await log(traceId, "delivery-service", success ? "sent" : "send_failed", {
        success,
      });
      publishStatus(`status.${traceId}`, {
        messageId: traceId,
        success,
        detail: success ? "ok" : "simulated_failure",
        attempt: message.meta?.attempts || 0,
      });
    });
    console.log(`Consumer bound to queue ${queueName}`);
  }
}

await startConsumers();

const app = express();
app.use(bodyParser.json());
app.get("/health", (req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`Delivery Service listening on ${PORT}`));
