import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TOKEN_NAME = 'admin_token';

export async function POST() {
  const jar = await cookies();
  jar.delete(TOKEN_NAME);
  return NextResponse.json({ ok: true });
}
