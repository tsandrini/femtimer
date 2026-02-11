import type { Page } from "@/types/pages";
import Dexie, { type EntityTable } from "dexie";

export interface Solve {
  id: number;
  time: number; // in milliseconds
  scramble: string;
  scrambleType: string; // e.g., "333", "ru", "oll"
  event: string; // WCA event (for backwards compat)
  sessionId: number;
  pageId?: string; // Which page this solve was made on
  tags: string[]; // User-defined tags
  timestamp: Date;
  penalty: "none" | "+2" | "dnf";
  comment?: string;
}

export interface Session {
  id: number;
  name: string;
  event: string;
  pageId?: string; // Default page for this session
  createdAt: Date;
  isArchived: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

// Page type is imported from types/pages.ts

const db = new Dexie("FemtimerDB") as Dexie & {
  solves: EntityTable<Solve, "id">;
  sessions: EntityTable<Session, "id">;
  pages: EntityTable<Page, "id">;
  tags: EntityTable<Tag, "id">;
};

// Version 1: Original schema
db.version(1).stores({
  solves: "++id, sessionId, event, timestamp",
  sessions: "++id, event, createdAt",
});

// Version 2: Extended schema with pages, tags, and enhanced solves
db.version(2)
  .stores({
    solves: "++id, sessionId, scrambleType, pageId, timestamp",
    sessions: "++id, event, pageId, createdAt",
    pages: "id, name, isTemplate, sortOrder, createdAt",
    tags: "id, name, createdAt",
  })
  .upgrade((tx) => {
    // Migrate existing solves to new schema
    return tx
      .table("solves")
      .toCollection()
      .modify((solve: Solve) => {
        solve.scrambleType = solve.event || "333";
        solve.tags = solve.tags || [];
      });
  });

export { db };

// ============================================
// Solve helpers
// ============================================

export async function addSolve(solve: Omit<Solve, "id">): Promise<number> {
  return await db.solves.add(solve as Solve);
}

export async function getSolvesBySession(sessionId: number): Promise<Solve[]> {
  return await db.solves.where("sessionId").equals(sessionId).toArray();
}

export async function getSolvesByPage(pageId: string): Promise<Solve[]> {
  return await db.solves.where("pageId").equals(pageId).toArray();
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

// ============================================
// Session helpers
// ============================================

export async function createSession(
  name: string,
  event: string,
): Promise<number> {
  return await db.sessions.add({
    name,
    event,
    createdAt: new Date(),
    isArchived: false,
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

// ============================================
// Page helpers
// ============================================

export async function getAllPages(): Promise<Page[]> {
  return await db.pages.orderBy("sortOrder").toArray();
}

export async function getPage(id: string): Promise<Page | undefined> {
  return await db.pages.get(id);
}

export async function addPage(page: Page): Promise<string> {
  await db.pages.add(page);
  return page.id;
}

export async function updatePage(
  id: string,
  updates: Partial<Page>,
): Promise<void> {
  await db.pages.update(id, { ...updates, updatedAt: new Date() });
}

export async function saveFullPage(page: Page): Promise<void> {
  await db.pages.put({ ...page, updatedAt: new Date() });
}

export async function deletePage(id: string): Promise<void> {
  await db.pages.delete(id);
}

export async function getTemplatePages(): Promise<Page[]> {
  return await db.pages.where("isTemplate").equals(1).toArray();
}

export async function getUserPages(): Promise<Page[]> {
  return await db.pages.where("isTemplate").equals(0).sortBy("sortOrder");
}

// ============================================
// Tag helpers
// ============================================

export async function getAllTags(): Promise<Tag[]> {
  return await db.tags.toArray();
}

export async function addTag(tag: Tag): Promise<string> {
  await db.tags.add(tag);
  return tag.id;
}

export async function deleteTag(id: string): Promise<void> {
  await db.tags.delete(id);
}
