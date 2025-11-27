import express from "express";
import { generateId } from "../utils/id.js";
import { validatePayload } from "../core/validator.js";
import { isDuplicate, storeMessage } from "../core/dedup.store.js";
import {
  publishMessage,
  subscribeStatuses,
  initEventBus,
} from "../core/eventBus.js";
import { log } from "../utils/logger.js";
import { handleStatus } from "../core/retry.handler.js";
import crypto from "crypto";

const router = express.Router();

function fingerprintOf(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ to: payload.to, body: payload.body }))
    .digest("hex");
}

export async function initRoutes(app) {
  // hook statuses
  await initEventBus();
  subscribeStatuses(handleStatus);

  router.post("/messages", async (req, res) => {
    try {
      const payload = req.body;
      validatePayload(payload);

      const id = payload.id || generateId();
      const fp = fingerprintOf(payload);
      if (await isDuplicate(id, fp)) {
        await log(id, "task-router", "duplicate_detected", { payload });
        return res.status(200).json({ status: "duplicate_ignored", id });
      }

      // store & publish
      await storeMessage(id, payload, fp);
      await log(id, "task-router", "received", { payload });

      const message = { id, ...payload, meta: { attempts: 0 } };
      await publishMessage(payload.channel, message);
      await log(id, "task-router", "published", { routing: payload.channel });

      return res.status(202).json({ status: "accepted", id });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

  app.use("/", router);
}
