import { FastifyInstance } from "fastify";

export async function vendorRoutes(app: FastifyInstance) {
  app.get("/", async () => ({
    success: true,
    data: { vendors: [] },
  }));

  app.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    return {
      success: true,
      data: { vendorId: id },
    };
  });
}
