Communication Aggregator System (Microservices | RabbitMQ | Elasticsearch | Modular Channels)

A simplified Communication Aggregator designed using Node.js, RabbitMQ, Elasticsearch, Kibana, and a fully modular channel plugin system.
Messages are routed intelligently to channels like Email, SMS, WhatsApp, and new channels can be added without modifying core logic.

1.  Project Overview

    This system contains 3 independent microservices:

    1. Task Router Service

       Accepts incoming messages (REST API)
       Validates request
       Deduplicates messages
       Publishes to RabbitMQ based on channel
       Listens for delivery status
       Retry logic (max 3 retries)
       Sends logs to Logging Service

    2. Delivery Service

       Consumes channel-specific queues
       Simulates sending messages
       Stores delivery results in LowDB (delivery-db.json)
       Publishes delivery status to RabbitMQ
       Sends logs to Logging Service

    3. Logging Service

       Receives logs from both services
       Stores logs into Elasticsearch (comm-logs index)
       Supports visualisation in Kibana

2.  High-Level Architecture (HLD)
  ┌────────────────────┐
    │ Client App │
    │ (POST /messages) │
    └─────────┬──────────┘
    │
    ▼
    ┌────────────────────────┐
    │ Task Router Service │
    │ - Validation │
    │ - Dedup │
    │ - Publish to Queue │
    │ - Retry Logic │
    └───────┬────────────────┘
    │ publish(channel)
    ▼
    ┌────────────────────────────────────────┐
    │ RabbitMQ │
    │ (message_exchange + channel queues) │
    └────┬──────────────┬───────────────┬────┘
    │ │ │
    ▼ ▼ ▼
    Email Queue SMS Queue WhatsApp Queue
    │ │ │
    ▼ ▼ ▼
    ┌────────────────────────────────────────────────┐
    │ Delivery Service (Workers) │
    │ - email.sender │
    │ - sms.sender │
    │ - whatsapp.sender │
    └──────────┬────────────┬───────────────┬────────┘
    │ │ │
    ▼ ▼ ▼
    publish(status) via status_exchange (RabbitMQ)
    │
    ▼
    ┌────────────────────────┐
    │ Task Router Service │
    │ - Handle status │
    │ - Retry if needed │
    └───────────┬────────────┘
    │
    ▼
    ┌──────────────────┐
    │ Logging Service │
    │ → Elasticsearch │
    └──────────────────┘
    │
    ▼
    Kibana Dashboard


3.  Folder Structure
    communication-system/
    │
    ├── task-router/
    │ ├── src/
    │ │ ├── api/
    │ │ ├── channels/
    │ │ ├── core/
    │ │ ├── utils/
    │ │ ├── config/
    │ │ └── index.js
    │
    ├── delivery-service/
    │ ├── src/
    │ │ ├── channels/
    │ │ ├── core/
    │ │ ├── utils/
    │ │ ├── config/
    │ │ └── index.js
    │
    ├── logging-service/
    │ ├── src/
    │ │ ├── elastic.js
    │ │ └── index.js
    │
    └── docker-compose.yml

4.  How to Start the Project (Development Mode)

    Follow these steps to start RabbitMQ, Elasticsearch, Kibana, and all microservices.

    Step 1 — Prerequisites

        Install:

        Docker Desktop

        Node.js 18+

        Docker Compose enabled

    Step 2 — Start All Services

        Run inside project root (communication-system/):

        Windows PowerShell
        docker compose up --build

        macOS/Linux
        docker compose up --build

    Step 3 — Verify Services
    Service URL
    RabbitMQ UI http://localhost:15672
    (guest/guest)
    Elasticsearch http://localhost:9200

        Kibana	http://localhost:5601

        Task Router	http://localhost:3000/messages

        Delivery Service	http://localhost:3001/health

        Logging Service	http://localhost:3002/health

    5. Testing the System
       Send Email
       curl -X POST http://localhost:3000/messages \
       -H "Content-Type: application/json" \
       -d '{"channel":"email","to":"alice@example.com","body":"Hello Alice"}'

       Send SMS
       curl -X POST http://localhost:3000/messages \
       -H "Content-Type: application/json" \
       -d '{"channel":"sms","to":"+911234567890","body":"Your OTP is 1234"}'

       Response:

       {
       "status": "accepted",
       "id": "<trace-id>"
       }

5.  Viewing Logs in Kibana

    Open Kibana → http://localhost:5601

    Go to Discover
    Create index pattern:

    comm-logs
    Search logs by trace ID:
    traceId: "<id>"

    You will see:

    received
    published
    consumed
    sent
    send_failed
    retry_published
    failed_after_retries

6.  Retry Logic

    Task Router listens to status_exchange and handles:

    Success → stop retries
    Failure → retry up to 3 times
    After 3 attempts → mark as permanent failure
    Retry is dynamic and does not require changing any delivery code.

7.  Adding a New Channel (Plugin Based)

    To add Telegram (example):

    1. Task Router

       Create file:

       task-router/src/channels/telegram.channel.js

       export const name = "telegram";
       export function validate(payload) {
       if (!payload.to) throw new Error("Invalid telegram recipient");
       }

    2. Delivery Service

       Create file:

       delivery-service/src/channels/telegram.sender.js

       export const name = "telegram";
       export async function send(msg) {
       return true; // simulate delivery
       }

    3. Restart services

       No core logic changes required.
       Channels auto-register via channels/index.js.

8.  Scaling Plan

    Task Router: Add replicas behind load balancer
    Delivery Service: Increase worker instances per channel
    RabbitMQ: Move to cluster / cloud MQ
    Logging Replace: LowDB with Redis/MongoDB
    Elasticsearch: Move to 3-node cluster

9.  Summary

    This Communication Aggregator demonstrates:

    Microservices architecture
    Modular channel routing
    Async messaging using RabbitMQ
    Retry logic
    Deduplication
    Logging pipeline with Elastic + Kibana
    Docker-based orchestration
    Extendability without modifying core code
    Perfect as a backend architecture assignment & interview demo.
