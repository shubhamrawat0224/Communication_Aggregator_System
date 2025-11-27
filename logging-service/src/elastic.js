import { Client } from "@elastic/elasticsearch";
const ELASTIC_URL = process.env.ELASTIC_URL || "http://localhost:9200";
export const client = new Client({ node: ELASTIC_URL });

export async function indexLog(index, doc) {
  try {
    await client.index({ index, document: doc });
  } catch (e) {
    console.error("[elastic] index error", e.message);
    throw e;
  }
}
