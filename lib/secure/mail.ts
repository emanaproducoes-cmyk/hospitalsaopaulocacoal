import { cfg, DEMO } from './config';

/**
 * E-mails transacionais (código de acesso, avisos de exame, pedidos de permissão, alertas).
 * Regra: nenhum dado clínico vai no e-mail. O e-mail só avisa e leva ao ambiente seguro.
 * Produção: Resend. Demonstração: caixa de saída em memória, visível na tela de testes.
 */

export interface Mail {
  to: string;
  subject: string;
  title: string;
  lines: string[];
  code?: string;
  button?: { label: string; href: string };
  kind: 'codigo' | 'aviso' | 'permissao' | 'alerta' | 'convite';
}

export interface OutboxItem extends Mail { at: string }
const g = globalThis as unknown as { __hbspOutbox?: OutboxItem[] };
export const outbox = () => (g.__hbspOutbox ??= []);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function html(m: Mail): string {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f2f5fb;font-family:Arial,Helvetica,sans-serif;color:#14214f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dce3f2">
<tr><td style="background:linear-gradient(135deg,#14214f,#294197);padding:22px 28px;color:#ffffff;font-size:18px;font-weight:bold">Hospital São Paulo · Ambiente seguro</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px;color:#14214f">${esc(m.title)}</h1>
${m.lines.map((l) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#42506b">${esc(l)}</p>`).join('')}
${m.code ? `<p style="margin:20px 0;font-size:34px;letter-spacing:10px;font-weight:bold;color:#294197;text-align:center">${esc(m.code)}</p>` : ''}
${m.button ? `<p style="text-align:center;margin:24px 0"><a href="${esc(m.button.href)}" style="background:#294197;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">${esc(m.button.label)}</a></p>` : ''}
<p style="margin:24px 0 0;font-size:12px;color:#6b7896;border-top:1px solid #e4e9f4;padding-top:14px">Este é um aviso automático do ambiente seguro e criptografado do Hospital São Paulo de Cacoal. Nunca pedimos senha ou código por telefone, WhatsApp ou e-mail. Se você não reconhece esta mensagem, ignore-a e avise a central.</p>
</td></tr></table></td></tr></table></body></html>`;
}

export async function sendMail(m: Mail): Promise<void> {
  if (DEMO || !cfg.resendKey) {
    outbox().unshift({ ...m, at: new Date().toISOString() });
    outbox().splice(50);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: cfg.mailFrom, to: [m.to], subject: m.subject, html: html(m), text: [m.title, ...m.lines, m.code ? `Código: ${m.code}` : '', m.button ? `${m.button.label}: ${m.button.href}` : ''].filter(Boolean).join('\n\n') }),
  });
  if (!res.ok) throw new Error(`e-mail: ${res.status}`);
}
