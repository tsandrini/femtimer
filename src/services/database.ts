import Dexie, { type EntityTable } from "dexie";

export interface Solve {
  id: number;
  time: number; // in milliseconds
  scramble: string;
  event: string;
  sessionId: number;
  timestamp: Date;
  penalty: "none" | "+2" | "dnf";
  comment?: string;
}

export interface Session {
  id: number;
  name: string;
  event: string;
  createdAt: Date;
}

const db = new Dexie("FemtimerDB") as Dexie & {
  solves: EntityTable<Solve, "id">;
  sessions: EntityTable<Session, "id">;
};

db.version(1).stores({
  solves: "++id, sessionId, event, timestamp",
  sessions: "++id, event, createdAt",
});

export { db };

// Helper functions for common operations
export async function addSolve(solve: Omit<Solve, "id">): Promise<number> {
  return await db.solves.add(solve as Solve);
}

export async function getSolvesBySession(sessionId: number): Promise<Solve[]> {
  return await db.solves.where("sessionId").equals(sessionId).toArray();
}

export async function getRecentSolves(
  sessionId: number,
  count: number,
): Promise<Solve[]> {
  return await db.solves
    .where("sessionId")
    .equals(sessionId)
    .reverse()
    .limit(count)
    .toArray();
}

export async function deleteSolve(id: number): Promise<void> {
  await db.solves.delete(id);
}

export async function updateSolve(
  id: number,
  updates: Partial<Solve>,
): Promise<void> {
  await db.solves.update(id, updates);
}

export async function createSession(
  name: string,
  event: string,
): Promise<number> {
  return await db.sessions.add({
    name,
    event,
    createdAt: new Date(),
  } as Session);
}

export async function getSessions(): Promise<Session[]> {
  return await db.sessions.toArray();
}

export async function getOrCreateDefaultSession(
  event: string,
): Promise<Session> {
  const existing = await db.sessions.where("event").equals(event).first();

  if (existing) {
    return existing;
  }

  const id = await createSession(`${event} Session`, event);
  return (await db.sessions.get(id))!;
}
