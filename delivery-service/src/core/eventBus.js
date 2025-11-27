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

export async function assertAndConsume(queueName, routingKey, onMessage) {
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, MESSAGE_EXCHANGE, routingKey);
  await channel.consume(
    queueName,
    async (msg) => {
      if (!msg) return;
      let data;
      try {
        data = JSON.parse(msg.content.toString());
      } catch (e) {
        channel.ack(msg);
        return;
      }
      await onMessage(data);
      channel.ack(msg);
    },
    { noAck: false }
  );
}

export function publishStatus(routingKey, status) {
  channel.publish(
    STATUS_EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(status)),
    { persistent: true }
  );
}
