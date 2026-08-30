import { FastifyInstance } from "fastify";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/overview", async () => ({
    success: true,
    data: {
      paymentExceptions: 12,
      investigating: 4,
      awaitingApproval: 2,
      verified: 41,
      blocked: 3,
    },
  }));
}
