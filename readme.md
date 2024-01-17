# Sample Node.js Application with OpenTelemetry Configuration

This repository contains a simple Node.js application that demonstrates how to configure OpenTelemetry to monitor both application and infrastructure. The application includes Docker Compose configurations for easy deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js
- Docker

## Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/kloudmate/samplenodejs.git
   ```

2. Change into the repository directory:

   ```bash
   cd samplenodejs
   ```

3. Create a `.env` file in the root directory. You can refer to the provided `env.example` for the required environment variables.

4. Run the application using Docker Compose:

   ```bash
   docker-compose up -d
   ```

This will start the main application along with a PostgreSQL database, Redis, and the OpenTelemetry collector.

5. Visit `http://localhost:3006`

## OpenTelemetry Configuration

The application is instrumented using OpenTelemetry to collect traces, logs, and metrics. The configuration can be found in the `server/src/instrumentation.js` file and `client/src/tracing.js`.

Feel free to explore the code and modify the OpenTelemetry configuration as needed for your specific requirements.
