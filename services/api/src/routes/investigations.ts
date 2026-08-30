import { FastifyInstance } from "fastify";
import { getDatabase } from "@beforepay/database";
import {
  investigations,
  investigationEvents,
  paymentExceptions,
  payments,
  invoices,
  evidence,
  approvals,
} from "@beforepay/database";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { runDemoInvestigation, resumeAfterApproval } from "../lib/demo-investigation.js";

const GetInvestigationsQuerySchema = z.object({
  page: z
    .string()
    .pipe(z.coerce.number().int().min(1))
    .optional()
    .default("1"),
  limit: z
    .string()
    .pipe(z.coerce.number().int().min(1).max(100))
    .optional()
    .default("10"),
  status: z
    .enum([
      "pending",
      "investigating",
      "awaiting_approval",
      "approved",
      "rejected",
      "completed",
    ])
    .optional(),
});

const ApproveSchema = z.object({
  approved: z.boolean(),
  reasoning: z.string().optional(),
});

export async function investigationRoutes(app: FastifyInstance) {
  // GET /investigations - List all investigations
  app.get(
    "/",
    async (request, reply) => {
      try {
        const query = GetInvestigationsQuerySchema.parse(request.query);
        const db = await getDatabase();

        const offset = (query.page - 1) * query.limit;

        let query_builder = db.select().from(investigations);

        if (query.status) {
          query_builder = query_builder.where(
            eq(investigations.status, query.status)
          );
        }

        const results = await query_builder
          .orderBy(desc(investigations.createdAt))
          .limit(query.limit)
          .offset(offset);

        return {
          success: true,
          data: results,
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

  // GET /investigations/:id - Get investigation details
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
      console.error("Error fetching investigation:", error);
      throw error;
    }
  });

  // GET /investigations/:id/events - Get investigation events
  app.get("/:id/events", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const db = await getDatabase();

      // Verify investigation exists
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

      const events = await db
        .select()
        .from(investigationEvents)
        .where(eq(investigationEvents.investigationId, id))
        .orderBy(desc(investigationEvents.createdAt));

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      console.error("Error fetching investigation events:", error);
      throw error;
    }
  });

  // POST /investigations/demo/start — start the demo investigation
  app.post("/demo/start", async (request, reply) => {
    try {
      const db = await getDatabase();
      // Find the first "new" or "investigating" payment exception
      const exception = await db
        .select()
        .from(paymentExceptions)
        .where(eq(paymentExceptions.status, "new"))
        .then((r) => r[0]);

      if (!exception) {
        reply.statusCode = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "No demo exception found. Run db:seed first." } };
      }

      // Start investigation async (don't await — let SSE stream the events)
      const investigationId = await runDemoInvestigation(exception.id).catch((e) => {
        console.error("Demo investigation error:", e);
      });

      return { success: true, data: { investigationId } };
    } catch (error) {
      console.error("Error starting demo:", error);
      throw error;
    }
  });

  // POST /investigations/:id/approve - Approve investigation action
  app.post("/:id/approve", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = z.object({ approved: z.boolean(), approvedBy: z.string().optional(), reasoning: z.string().optional(), approvalId: z.string().optional() }).parse(request.body);
      const db = await getDatabase();

      const investigation = await db.select().from(investigations).where(eq(investigations.id, id)).then((r) => r[0]);
      if (!investigation) {
        reply.statusCode = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Investigation not found" } };
      }

      if (body.approved && body.approvalId) {
        // Resume the investigation async
        resumeAfterApproval(id, body.approvalId, body.approvedBy || "human_operator").catch((e) => {
          console.error("Resume error:", e);
        });
      } else {
        await db.update(investigations).set({ status: body.approved ? "approved" : "rejected" }).where(eq(investigations.id, id));
      }

      return { success: true, data: { investigationId: id, approved: body.approved, timestamp: new Date().toISOString() } };
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.statusCode = 400;
        return { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid body", details: error.errors } };
      }
      throw error;
    }
  });
}
