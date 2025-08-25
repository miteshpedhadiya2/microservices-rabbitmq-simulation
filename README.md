# Microservices RabbitMQ Simulation: Order Processing Demo

[![Releases](https://img.shields.io/badge/Releases-Download-blue?logo=github&style=for-the-badge)](https://github.com/miteshpedhadiya2/microservices-rabbitmq-simulation/releases)

A compact, hands-on demo of a microservices order pipeline. It uses REST APIs, RabbitMQ for async messaging, and Docker Compose to run services in containers. The demo focuses on message flow, persistence, and basic fault tolerance.

- Topics: asynchronous, docker, docker-compose, docker-container, javascript, message-broker, microservices, microservices-architecture, rabbitmq, rest-api, restful-api
- Releases: download and execute the release file from Releases: https://github.com/miteshpedhadiya2/microservices-rabbitmq-simulation/releases

Badges
- [![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com/)
- [![Node.js](https://img.shields.io/badge/Node.js-LTS-green?logo=node.js)](https://nodejs.org/)
- [![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Message%20Broker-orange?logo=rabbitmq)](https://www.rabbitmq.com/)

Architecture diagram

![Microservices Architecture](https://miro.medium.com/max/1400/1*yaKxW2K6g0q5h0w3h1XnPQ.png)

Table of contents

- Quick concept
- Components
- Message flows
- Key features
- Run locally (Docker Compose)
- REST API examples
- Message schema
- Fault tolerance and persistence
- Scaling and deployment
- Testing
- Logs and observability
- Troubleshooting
- Contributing
- License

Quick concept

This demo shows a simple order lifecycle across multiple services. The system decouples components with RabbitMQ so producers and consumers operate independently. Services run in Docker containers to mirror real deployments.

Components

- api-gateway
  - Exposes REST endpoints for clients.
  - Validates incoming orders and forwards them to order-service.
- order-service
  - Receives new orders via REST.
  - Publishes order-created events to RabbitMQ.
  - Persists order state to a local store (in demo, a simple JSON DB).
- payment-service
  - Listens for order-created events.
  - Processes payment asynchronously.
  - Emits payment-status events.
- inventory-service
  - Subscribes to order-created events.
  - Reserves stock and emits inventory-status events.
- shipping-service
  - Waits for confirmed payment and confirmed inventory.
  - Schedules shipment and publishes shipping events.
- rabbitmq
  - Central message broker for async events.
  - Configured with durable queues and persistent messages.
- docker-compose
  - Orchestrates services and RabbitMQ in a single network.

Message flows

1. Client sends POST /orders to api-gateway.
2. api-gateway forwards request to order-service.
3. order-service creates an order, persists it, and publishes order.created to RabbitMQ.
4. payment-service and inventory-service consume order.created.
5. payment-service processes payment and publishes order.payment.completed or order.payment.failed.
6. inventory-service reserves stock and publishes order.inventory.reserved or order.inventory.failed.
7. shipping-service listens for payment completed and inventory reserved. When both arrive, it publishes order.shipped.

Event routing uses Topic exchanges to let services subscribe by event type. Queues use durable flag. Messages use persistent delivery mode.

Key features

- Asynchronous messaging via RabbitMQ.
- Durable queues and persistent messages.
- Simple fault tolerance: retries and dead-letter exchange patterns.
- Dockerized services for consistent runtime.
- Clear separation of concerns using microservices.
- REST API for synchronous client interactions.

Run locally (Docker Compose)

1. Clone the repo.
2. Build and start services:

   docker-compose up --build

3. Open management UIs:
   - RabbitMQ management: http://localhost:15672 (guest / guest)
   - API gateway: http://localhost:3000

Releases

Download and execute the release file from the Releases page: https://github.com/miteshpedhadiya2/microservices-rabbitmq-simulation/releases

If you prefer a quick start, use the provided docker-compose.yml. The Releases page may contain compiled images, scripts, or deployment archives. Download the release artifact you need and run it as documented in the release notes.

REST API examples

Create an order

curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-1001",
    "items": [{"sku":"sku-101","qty":2}],
    "payment": {"method":"card","token":"tok_test"}
  }'

Get order status

curl http://localhost:3000/orders/{orderId}

List orders

curl http://localhost:3000/orders

Sample responses

- POST /orders -> 202 Accepted with orderId
- GET /orders/{orderId} -> 200 OK with order state and event history

Message schema

Use simple JSON messages for events. Example order.created:

{
  "event": "order.created",
  "data": {
    "orderId": "ord-123",
    "customerId": "cust-1001",
    "items": [{"sku":"sku-101","qty":2}],
    "total": 49.98,
    "createdAt": "2025-08-01T12:00:00Z"
  },
  "meta": {
    "traceId": "trace-abc",
    "source": "order-service"
  }
}

Status events are small and typed:

{
  "event": "order.payment.completed",
  "data": {"orderId":"ord-123","status":"completed","transactionId":"tx-555"},
  "meta": {}
}

Design notes

- Exchanges
  - Use topic exchange "orders.topic".
  - Bind queues with keys like "order.created", "order.payment.*", "order.inventory.*".
- Durability
  - Mark exchanges and queues as durable.
  - Publish messages with deliveryMode=2 (persistent).
- Dead-lettering
  - Attach dead-letter exchange to critical queues to capture failures.
- Retries
  - Use a retry queue with TTL and dead-letter back to the main queue to implement backoff.

Fault tolerance and persistence

- Persistent messages ensure RabbitMQ saves messages to disk on broker crash.
- Durable queues remain after broker restart.
- Services use local persistence to track event status so they can resume work after restart.
- Design keeps operations idempotent. Consumers check event_id or order state and skip already-processed events.

Scaling and deployment

- Scale consumer services horizontally by increasing container replicas in production.
- Ensure each consumer instance gets its own queue or use competing consumers on a shared queue.
- Configure prefetch limits to avoid processing bursts.
- Use separate RabbitMQ clusters per environment or high-availability cluster with mirrored queues.
- For cloud deployments, use Kubernetes, set liveness and readiness probes, and mount persistent storage for stateful services.

Testing

Unit tests
- Each service contains unit tests for core logic. Run npm test inside the service folder.

Integration tests
- Run docker-compose up and execute test scripts that hit real endpoints and inspect message flows.
- Use test doubles for payment gateway to simulate success and failure.

Load testing
- Use tools like k6 or Artillery to generate HTTP load.
- Watch queue lengths, consumer throughput, and broker CPU.

Logs and observability

- Each service logs to STDOUT in JSON for easy collection.
- Include event IDs and trace IDs in logs to track an order across services.
- Add tracing headers like X-Trace-Id or traceparent for distributed traces.
- Use Prometheus metrics exporter for basic metrics (message rates, queue lengths, processing latency).
- RabbitMQ provides management metrics for queues and connections.

Troubleshooting

- RabbitMQ web UI shows queue depth and consumer counts.
- If messages do not arrive, check exchange and queue bindings.
- If messages stuck in queue, examine consumer logs for errors.
- For persistent message loss, confirm deliveryMode and durable flag settings.
- If a service cannot connect, verify network settings in docker-compose and environment variables.

Contributing

- Fork the repo, make changes, and open a pull request.
- Keep changes small and focused.
- Add tests for new behavior.
- Document new features in README.

Repository layout (example)

- docker-compose.yml
- services/
  - api-gateway/
    - src/
    - package.json
  - order-service/
    - src/
    - package.json
  - payment-service/
    - src/
    - package.json
  - inventory-service/
    - src/
    - package.json
  - shipping-service/
    - src/
    - package.json
- infra/
  - rabbitmq/
    - definitions.json
- docs/
  - sequence-diagram.png

Security

- Do not use guest/guest in production.
- Use TLS for RabbitMQ connections in production.
- Store secrets in a secret manager or environment variables injected by the orchestrator.
- Validate all input at the API gateway.

Common commands

Build and run

docker-compose up --build

Stop

docker-compose down

Rebuild one service

docker-compose up --build api-gateway

View logs

docker-compose logs -f order-service

Release artifacts

Download and execute the release file from Releases: https://github.com/miteshpedhadiya2/microservices-rabbitmq-simulation/releases

If the release page lists a packaged archive or script, download that artifact and run per the release notes. If the page does not show the asset you need, check the Releases section on GitHub for alternate artifacts.

References and links

- RabbitMQ: https://www.rabbitmq.com/
- Docker: https://www.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Distributed tracing: https://opentelemetry.io/

Images and icons used
- Architecture image from Medium (used for illustration)
- Badges via img.shields.io

License

MIT License

Acknowledgements

- Patterns inspired by common event-driven microservice designs and RabbitMQ guides.