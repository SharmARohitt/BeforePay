import { useEffect, useState, useCallback } from "react";
import { Investigation, InvestigationEvent } from "@beforepay/types";

interface UseInvestigationOptions {
  id: string;
  autoFetch?: boolean;
  pollInterval?: number;
}

interface UseInvestigationResult {
  investigation: Investigation | null;
  events: InvestigationEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInvestigation({
  id,
  autoFetch = true,
  pollInterval = 3000,
}: UseInvestigationOptions): UseInvestigationResult {
  const [investigation, setInvestigation] = useState<Investigation | null>(
    null
  );
  const [events, setEvents] = useState<InvestigationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchInvestigation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/investigations/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch investigation: ${response.status}`);
      }

      const data = await response.json();
      setInvestigation(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Failed to fetch investigation:", err);
    } finally {
      setLoading(false);
    }
  }, [id, apiUrl]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/investigations/${id}/events`);
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.data || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  }, [id, apiUrl]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchInvestigation(), fetchEvents()]);
  }, [fetchInvestigation, fetchEvents]);

  useEffect(() => {
    if (!autoFetch) return;

    // Initial fetch
    refetch();

    // Set up polling
    const interval = setInterval(refetch, pollInterval);

    return () => clearInterval(interval);
  }, [id, autoFetch, pollInterval, refetch]);

  return {
    investigation,
    events,
    loading,
    error,
    refetch,
  };
}

export function useInvestigationList() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchInvestigations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/investigations`);
      if (!response.ok) {
        throw new Error(`Failed to fetch investigations: ${response.status}`);
      }

      const data = await response.json();
      setInvestigations(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Failed to fetch investigations:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchInvestigations();

    // Poll every 5 seconds
    const interval = setInterval(fetchInvestigations, 5000);
    return () => clearInterval(interval);
  }, [fetchInvestigations]);

  return { investigations, loading, error, refetch: fetchInvestigations };
}

export function useApproval() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const approve = useCallback(
    async (investigationId: string, reasoning?: string) => {
      try {
        const response = await fetch(
          `${apiUrl}/investigations/${investigationId}/approve`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              approved: true,
              reasoning: reasoning || "Approved by user",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to approve: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        console.error("Failed to approve:", err);
        throw err;
      }
    },
    [apiUrl]
  );

  return { approve };
}
