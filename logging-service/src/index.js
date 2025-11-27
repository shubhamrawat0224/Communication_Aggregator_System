import express from "express";
import bodyParser from "body-parser";
import { indexLog, client } from "./elastic.js";

const app = express();
app.use(bodyParser.json());
const INDEX = "comm-logs";

app.post("/logs", async (req, res) => {
  const body = req.body;
  try {
    // ensure index exists
    await client.indices.create({ index: INDEX }, { ignore: [400] });
  } catch (e) {
    // ignore if already exists
  }
  try {
    await indexLog(INDEX, body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "es_index_failed", message: e.message });
  }
});

app.get("/health", async (req, res) => {
  try {
    await client.ping();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
});

app.listen(3002, () => console.log("Logging service running on 3002"));
