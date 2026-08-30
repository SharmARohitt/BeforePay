import { FastifyInstance } from "fastify";

export async function paymentRoutes(app: FastifyInstance) {
  app.get("/", async () => ({
    success: true,
    data: { payments: [] },
  }));

  app.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    return {
      success: true,
      data: { paymentId: id },
    };
  });

  app.get("/:id/exceptions", async (request) => {
    const { id } = request.params as { id: string };
    return {
      success: true,
      data: { paymentId: id, exceptions: [] },
    };
  });
}
