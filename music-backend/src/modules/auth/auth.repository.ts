import { db } from "../../config/db";
import { users } from "../../database/schema";
import { eq } from "drizzle-orm";

export class AuthRepository {
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user ?? null;
  }

  async createUser(input: {
    email: string;
    username: string;
    passwordHash: string;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        username: input.username,
        passwordHash: input.passwordHash,
      })
      .returning();
    return user;
  }

  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user ?? null;
  }
}
