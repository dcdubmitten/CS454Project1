const express = require("express");
const { createClient } = require("redis");

const app = express();

const PORT = Number(process.env.PORT) || 8080;
const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

const redis = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
});

redis.on("error", (error) => {
  console.error("Redis client error:", error);
});

async function startServer() {
  await redis.connect();

  app.get("/convert", async (req, res) => {
    const rawLbs = req.query.lbs;

    if (rawLbs === undefined) {
      return res.status(400).json({
        error: "Query parameter lbs is required and must be a number."
      });
    }

    if (Array.isArray(rawLbs)) {
      return res.status(400).json({
        error: "Query parameter lbs is required and must be a number."
      });
    }

    const lbsString = rawLbs.trim();

    if (lbsString === "") {
      return res.status(400).json({
        error: "Query parameter lbs is required and must be a number."
      });
    }

    const lbs = Number(lbsString);

    if (Number.isNaN(lbs)) {
      return res.status(400).json({
        error: "Query parameter lbs is required and must be a number."
      });
    }

    if (!Number.isFinite(lbs)) {
      return res.status(422).json({
        error: "lbs must be a non-negative, finite number."
      });
    }

    if (lbs < 0) {
      return res.status(422).json({
        error: "lbs must be a non-negative, finite number."
      });
    }

    const kg = Number((lbs * 0.45359237).toFixed(3));

    await redis.incr("conversions");

    return res.status(200).json({
      lbs,
      kg,
      formula: "kg = lbs * 0.45359237"
    });
  });

  app.get("/stats", async (req, res) => {
    try {
      const count = await redis.get("conversions");

      return res.status(200).json({
        conversions: Number(count || 0)
      });
    } catch (error) {
      console.error("Unable to read Redis statistics:", error);

      return res.status(503).json({
        error: "Unable to read conversion statistics."
      });
    }
  });

  app.get("/health", (req, res) => {
    return res.status(200).json({
      status: "ok"
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Conversion service listening on port ${PORT}`);
    console.log(`Redis configured on ${REDIS_HOST}:${REDIS_PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
