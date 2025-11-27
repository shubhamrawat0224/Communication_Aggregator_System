// Simple dedup store using lowdb
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
const DB_PATH = path.join(process.cwd(), "task-router-db.json");

const adapter = new JSONFile(DB_PATH);
const db = new Low(adapter);

await db.read();
db.data ||= { messages: {}, attempts: {} };
await db.write();

export async function isDuplicate(id, fingerprint) {
  await db.read();
  if (db.data.messages[id]) return true;
  // also check fingerprint uniqueness
  const existing = Object.values(db.data.messages).find(
    (m) => m.fingerprint === fingerprint
  );
  return !!existing;
}

export async function storeMessage(id, payload, fingerprint) {
  await db.read();
  db.data.messages[id] = {
    id,
    payload,
    fingerprint,
    createdAt: new Date().toISOString(),
  };
  db.data.attempts[id] = 0;
  await db.write();
}

export async function getMessage(id) {
  await db.read();
  return db.data.messages[id];
}

export async function incrementAttempts(id) {
  await db.read();
  db.data.attempts[id] = (db.data.attempts[id] || 0) + 1;
  await db.write();
  return db.data.attempts[id];
}

export async function getAttempts(id) {
  await db.read();
  return db.data.attempts[id] || 0;
}
