export const name = "whatsapp";

export async function send(message) {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
  return Math.random() > 0.25;
}
