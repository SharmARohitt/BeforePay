import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { getDatabase } from "@beforepay/database";
import { logger } from "./lib/logger.js";
import { investigationRoutes } from "./routes/investigations.js";
import { paymentRoutes } from "./routes/payments.js";
import { vendorRoutes } from "./routes/vendors.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { eventRoutes } from "./routes/events.js";

const API_PORT = parseInt(process.env.API_PORT || "3001", 10);
const API_HOST = process.env.API_HOST || "localhost";
const NODE_ENV = process.env.NODE_ENV || "development";

async function start() {
  try {
    // Initialize database
    const db = await getDatabase();
    logger.info("Database connected");

    // Create Fastify app
    const app = Fastify({
      logger: logger,
      trustProxy: true,
    });

    // Register plugins
    await app.register(helmet);
    await app.register(cors, {
      origin: true,
      credentials: true,
    });

    // Health check
    app.get("/health", async () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    }));

    // API v1 routes
    app.register(investigationRoutes, { prefix: "/api/v1/investigations" });
    app.register(paymentRoutes, { prefix: "/api/v1/payments" });
    app.register(vendorRoutes, { prefix: "/api/v1/vendors" });
    app.register(dashboardRoutes, { prefix: "/api/v1/dashboard" });
    app.register(eventRoutes, { prefix: "/api/v1/investigations" });

    // 404 handler
    app.setNotFoundHandler((request, reply) => {
      reply.statusCode = 404;
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Route ${request.method} ${request.url} not found`,
        },
      };
    });

    // Error handler
    app.setErrorHandler((error, request, reply) => {
      logger.error({ error, request }, "Unhandled error");

      reply.statusCode = error.statusCode || 500;
      return {
        success: false,
        error: {
          code: error.code || "INTERNAL_SERVER_ERROR",
          message:
            NODE_ENV === "development"
              ? error.message
              : "An internal server error occurred",
        },
      };
    });

    // Start server
    await app.listen({ port: API_PORT, host: API_HOST });

    logger.info(
      `🚀 API Server running at http://${API_HOST}:${API_PORT} (${NODE_ENV})`
    );
  } catch (error) {
    logger.error(error, "Failed to start server");
    process.exit(1);
  }
}

start();
