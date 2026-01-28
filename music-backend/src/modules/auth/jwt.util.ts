import jwt from "jsonwebtoken";
import { env } from "../../config/env";

const SECRET = env.JWT_SECRET; // add to env

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } {
  const payload = jwt.verify(token, SECRET) as { sub: string };
  return { userId: payload.sub };
}
