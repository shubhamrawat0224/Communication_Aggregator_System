export const name = "email";

export async function send(message) {
  // simulate send latency
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));
  // simple 80% success
  return Math.random() > 0.2;
}
