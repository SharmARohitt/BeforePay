import { FastifyInstance } from "fastify";
import { getDatabase } from "@beforepay/database";
import { investigationEvents, investigations, evidence, approvals } from "@beforepay/database";
import { eq, desc } from "drizzle-orm";

// In-memory SSE clients map: investigationId -> Set of reply objects
const clients = new Map<string, Set<any>>();

export function broadcastEvent(investigationId: string, event: object) {
  const subs = clients.get(investigationId);
  if (!subs) return;
  const data = `data: ${JSON.stringify(event)}\n\n`;
  subs.forEach((reply) => {
    try { reply.raw.write(data); } catch {}
  });
}

export async function eventRoutes(app: FastifyInstance) {
  // SSE stream for a specific investigation
  app.get("/:id/stream", async (request, reply) => {
    const { id } = request.params as { id: string };

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");
    reply.raw.flushHeaders();

    // Send existing events on connect
    try {
      const db = await getDatabase();
      const existingEvents = await db
        .select()
        .from(investigationEvents)
        .where(eq(investigationEvents.investigationId, id))
        .orderBy(investigationEvents.timestamp);

      for (const evt of existingEvents) {
        reply.raw.write(`data: ${JSON.stringify({ type: "event", payload: evt })}\n\n`);
      }

      // Send current investigation state
      const inv = await db.select().from(investigations).where(eq(investigations.id, id)).then(r => r[0]);
      if (inv) {
        reply.raw.write(`data: ${JSON.stringify({ type: "state", payload: inv })}\n\n`);
      }
    } catch {}

    // Register client
    if (!clients.has(id)) clients.set(id, new Set());
    clients.get(id)!.add(reply);

    // Heartbeat
    const heartbeat = setInterval(() => {
      try { reply.raw.write(": heartbeat\n\n"); } catch { clearInterval(heartbeat); }
    }, 15000);

    request.raw.on("close", () => {
      clearInterval(heartbeat);
      clients.get(id)?.delete(reply);
    });

    // Keep connection open
    await new Promise(() => {});
  });

  // GET /investigations/:id/evidence
  app.get("/:id/evidence", async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = await getDatabase();
    const items = await db
      .select()
      .from(evidence)
      .where(eq(evidence.investigationId, id))
      .orderBy(desc(evidence.createdAt));
    return { success: true, data: items };
  });

  // GET /investigations/:id/approvals
  app.get("/:id/approvals", async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = await getDatabase();
    const items = await db
      .select()
      .from(approvals)
      .where(eq(approvals.investigationId, id))
      .orderBy(desc(approvals.createdAt));
    return { success: true, data: items };
  });

  // GET /investigations/:id/decision
  app.get("/:id/decision", async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = await getDatabase();
    const inv = await db.select().from(investigations).where(eq(investigations.id, id)).then(r => r[0]);
    if (!inv) {
      reply.statusCode = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Investigation not found" } };
    }
    if (!inv.recommendation) {
      return { success: true, data: null };
    }
    const evidenceItems = await db.select().from(evidence).where(eq(evidence.investigationId, id));
    return {
      success: true,
      data: {
        investigationId: id,
        recommendation: inv.recommendation,
        confidence: inv.confidence,
        summary: inv.summary,
        evidence: evidenceItems,
        completedAt: inv.completedAt,
      },
    };
  });
}
