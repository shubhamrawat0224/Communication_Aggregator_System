export const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://127.0.0.1:5672";
export const LOGGING_URL =
  process.env.LOGGING_URL || "http://localhost:3002/logs";
export const PORT = process.env.PORT || 3000;
export const MESSAGE_EXCHANGE = "message_exchange";
export const STATUS_EXCHANGE = "status_exchange";
