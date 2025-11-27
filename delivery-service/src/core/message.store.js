import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
const DB_PATH = path.join(process.cwd(), "delivery-db.json");
const adapter = new JSONFile(DB_PATH);
const db = new Low(adapter);

await db.read();
db.data ||= { deliveries: [] };
await db.write();

export async function saveDelivery(record) {
  await db.read();
  db.data.deliveries.push(record);
  await db.write();
}
