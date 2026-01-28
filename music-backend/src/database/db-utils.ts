import { db } from "../config/db";
import { sql } from "drizzle-orm";

export async function withTransaction<T>(
  fn: (tx: typeof db) => Promise<T>
): Promise<T> {
  // drizzle-pg: tx is same type as db
  return db.transaction(async (tx) => fn(tx));
}

export async function now() {
  const [row] = await db.execute<{ now: string }>(sql`select now() as now`);
  return row.now;
}
