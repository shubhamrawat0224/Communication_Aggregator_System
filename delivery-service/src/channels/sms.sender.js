export const name = "sms";

export async function send(message) {
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));
  return Math.random() > 0.15;
}
