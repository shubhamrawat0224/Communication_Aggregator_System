import amqp from "amqplib";
import {
  RABBITMQ_URL,
  MESSAGE_EXCHANGE,
  STATUS_EXCHANGE,
} from "../config/env.js";

let conn, channel;
export async function initEventBus() {
  conn = await amqp.connect(RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertExchange(MESSAGE_EXCHANGE, "topic", { durable: true });
  await channel.assertExchange(STATUS_EXCHANGE, "topic", { durable: true });
  return { conn, channel };
}

export async function publishMessage(routingKey, message) {
  channel.publish(
    MESSAGE_EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
}

export async function publishStatus(routingKey, status) {
  channel.publish(
    STATUS_EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(status)),
    { persistent: true }
  );
}

export async function subscribeStatuses(onMessage) {
  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, STATUS_EXCHANGE, "#");
  await channel.consume(
    q.queue,
    (msg) => {
      if (!msg) return;
      let data;
      try {
        data = JSON.parse(msg.content.toString());
      } catch (e) {
        channel.ack(msg);
        return;
      }
      onMessage(data).catch((e) => console.error("status handler err", e));
      channel.ack(msg);
    },
    { noAck: false }
  );
}
