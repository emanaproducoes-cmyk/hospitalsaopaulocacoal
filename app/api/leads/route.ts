import { NextResponse } from 'next/server';
import type { LeadEnvelope } from '@/lib/domain/types';
import { deliver, rateLimited, validate } from '@/lib/server/leadHub';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/leads — porta única de entrada dos pedidos do site para o CRM. */
export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: 'muitas tentativas, tente em alguns minutos' }, { status: 429 });
  let env: LeadEnvelope;
  try {
    env = (await req.json()) as LeadEnvelope;
  } catch {
    return NextResponse.json({ ok: false, error: 'json inválido' }, { status: 400 });
  }
  const err = validate(env);
  if (err === 'spam') return NextResponse.json({ ok: true, protocol: 'HBSP-000000-00000' }); // não sinaliza ao robô
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 422 });
  const result = await deliver(env);
  return NextResponse.json(result, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
