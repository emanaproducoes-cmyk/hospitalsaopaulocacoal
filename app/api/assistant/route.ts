import { NextResponse } from 'next/server';
import { answer, type ChatMessage } from '@/lib/server/assistant';
import { rateLimited } from '@/lib/server/leadHub';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/assistant — { messages: [{ role, content }] } → { reply, actions, redFlag, source } */
export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (rateLimited('chat:' + ip, 40, 10 * 60 * 1000)) return NextResponse.json({ error: 'muitas mensagens, aguarde alguns minutos' }, { status: 429 });
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'json inválido' }, { status: 400 });
  }
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return NextResponse.json({ error: 'mensagem ausente' }, { status: 422 });
  const reply = await answer(messages);
  return NextResponse.json(reply, { headers: { 'Cache-Control': 'no-store' } });
}
