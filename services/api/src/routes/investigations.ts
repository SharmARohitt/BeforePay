import { FastifyInstance } from "fastify";
import { getDatabase } from "@beforepay/database";
import { investigations, paymentExceptions, payments } from "@beforepay/database/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const GetInvestigationsQuerySchema = z.object({
  page: z.string().pipe(z.coerce.number().int().min(1)).optional().default("1"),
  limit: z.string().pipe(z.coerce.number().int().min(1).max(100)).optional().default("10"),
  status: z.enum(["pending", "investigating", "awaiting_approval", "approved", "rejected", "completed"]).optional(),
});

export async function investigationRoutes(app: FastifyInstance) {
  // GET /api/v1/investigations
  app.get(
    "/",
    async (request, reply) => {
      try {
        const query = GetInvestigationsQuerySchema.parse(request.query);
        const db = await getDatabase();

        const offset = (query.page - 1) * query.limit;

        let query_builder = db.select().from(investigations);
        
        if (query.status) {
          query_builder = query_builder.where(eq(investigations.status, query.status));
        }

        const results = await query_builder
          .orderBy(desc(investigations.createdAt))
          .limit(query.limit)
          .offset(offset);

        return {
          success: true,
          data: {
            items: results,
            page: query.page,
            limit: query.limit,
            total: results.length,
          },
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply.statusCode = 400;
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid query parameters",
              details: error.errors,
            },
          };
        }
        throw error;
      }
    }
  );

  // GET /api/v1/investigations/:id
  app.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = await getDatabase();

      const investigation = await db
        .select()
        .from(investigations)
        .where(eq(investigations.id, id))
        .then((results) => results[0]);

      if (!investigation) {
        reply.statusCode = 404;
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Investigation not found",
          },
        };
      }

      return {
        success: true,
        data: investigation,
      };
    } catch (error) {
      throw error;
    }
  });

  // GET /api/v1/investigations/:id/events
  app.get("/:id/events", async (request, reply) => {
    const { id } = request.params as { id: string };
    return {
      success: true,
      data: {
        investigationId: id,
        events: [],
      },
    };
  });

  // POST /api/v1/investigations/:id/approve
  app.post("/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.statusCode = 201;
    return {
      success: true,
      data: {
        investigationId: id,
        approvalStatus: "approved",
      },
    };
  });
}
