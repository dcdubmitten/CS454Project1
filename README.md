# Project 1 — Portable Containerized REST Service

## Author: Dom Williams

This project provides a REST API that converts pounds (lbs) to kilograms (kg) and uses Redis to store the number of successful conversions.

The application consists of two containers:

* Node.js/Express REST application
* Redis database

## 1. Prerequisites

Install:

* Docker Desktop
* Node.js 22+ and npm
* Git
* VS Code

Run the commands below from the project directory in the VS Code terminal and open Docker Desktop before beginning.

## 2. Build and Start

Install the Node.js dependencies:

```bash
npm install
```

Build the application image and start the complete application:

```bash
docker compose up --build -d
```

Check that both services are running:

```bash
docker compose ps
```

The REST API is available at:

```text
http://localhost:8080
```

## 3. Test Each Endpoint

### GET /health

```bash
curl.exe http://localhost:8080/health
```

Expected:

```json
{
  "status": "ok"
}
```

### GET /convert

Successful conversions:

```bash
curl.exe "http://localhost:8080/convert?lbs=0"
curl.exe "http://localhost:8080/convert?lbs=150"
curl.exe "http://localhost:8080/convert?lbs=0.1"
```

Expected kilogram values are `0`, `68.039`, and `0.045`.

Test invalid input:

```bash
curl.exe -i "http://localhost:8080/convert"
curl.exe -i "http://localhost:8080/convert?lbs=abc"
curl.exe -i "http://localhost:8080/convert?lbs=-5"
```

These return `400`, `400`, and `422`, respectively.

### GET /stats

```bash
curl.exe http://localhost:8080/stats
```

This returns the number of successful conversions stored by Redis.

### Automated Tests

```bash
npm test
```

The test script checks the required successful conversions, invalid inputs, health endpoint, and Redis conversion count.

## 4. Logs and Service Inspection

View application logs:

```bash
docker compose logs app
```

View the status of all services:

```bash
docker compose ps
```

The app publishes port `8080`. Redis uses port `6379` internally and is not published to the host.

## 5. Stop and Clean Up

Stop the containers without removing them:

```bash
docker compose stop
```

Remove the containers and network while keeping the Redis data volume:

```bash
docker compose down
```

Remove the containers, network, and Redis volume:

```bash
docker compose down -v
```

The `-v` option deletes the stored Redis conversion count.

## 6. Design Decisions

**How the application locates Redis:**
The app uses `REDIS_HOST=redis` and `REDIS_PORT=6379`. Docker Compose resolves `redis` to the Redis container using its service name.

**Why Redis is not exposed to the host:**
Only the REST API needs to be accessed from the host. Keeping Redis private prevents direct external access to the database.

**Why the Redis volume is separate from the container:**
The named volume stores Redis data independently of the Redis container. This allows the conversion count to survive when the container is removed and recreated.

**Benefit of containerization:**
The application and Redis environment can be reproduced consistently on another computer without manually installing and configuring both services.

**Limitation of containerization:**
The system requires Docker and Docker Compose, adding an extra software layer compared with installing both services directly on a VM.
