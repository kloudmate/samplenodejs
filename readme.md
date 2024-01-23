# Sample Node.js Application with Beyla Configuration

This repository contains a simple Node.js application that demonstrates how to configure Beyla to monitor both application and infrastructure. The application includes Docker Compose configurations for easy deployment.

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

3. Go to _feature/ebpf_

   ```bash
   git cheakout feature/ebpf
   ```

4. Create a `.env` file in the root directory. You can refer to the provided `env.example` for the required environment variables.

5. Run the application using Docker Compose:

   ```bash
   docker-compose up -d
   ```

This will start the main application along with a PostgreSQL database, Redis, and the Beyla.

6. Visit `http://localhost:3006`

## Beyla Configuration

The application is instrumented using Beyla to collect traces, logs, and metrics. The configuration can be found in the `server/.env`.

Feel free to explore the code and modify the Beyla configuration as needed for your specific requirements.
