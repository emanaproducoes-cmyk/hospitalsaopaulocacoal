import type { FormValue, SectionDef } from './schema';

/**
 * Limpa o que chega do navegador: só campos do esquema, só opções válidas nas listas,
 * tamanhos limitados. Campos "somente médico" e "somente leitura" nunca são aceitos do paciente.
 */
export function sanitizeForm(schema: SectionDef[], input: unknown, role: 'paciente' | 'medico'): FormValue {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out: FormValue = {};
  for (const sec of schema) {
    for (const grp of sec.groups) {
      const clean = (raw: unknown) => {
        const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
        const r: Record<string, unknown> = {};
        for (const f of grp.fields) {
          if (f.readOnly) continue;
          if (f.doctorOnly && role !== 'medico') continue;
          const v = o[f.key];
          if (v === undefined || v === null || v === '') continue;
          switch (f.type) {
            case 'check':
              if (v === true) r[f.key] = true;
              break;
            case 'multi':
              if (Array.isArray(v)) {
                const allowed = new Set(f.options ?? []);
                const items = v.filter((x): x is string => typeof x === 'string' && allowed.has(x)).slice(0, 60);
                if (items.length) r[f.key] = items;
              }
              break;
            case 'select':
            case 'uf':
              if (typeof v === 'string' && (f.type === 'uf' ? /^[A-Z]{2}$/.test(v) : (f.options ?? []).includes(v))) r[f.key] = v;
              break;
            case 'number': {
              const n = Number(String(v).replace(',', '.'));
              if (Number.isFinite(n) && Math.abs(n) < 100000) r[f.key] = n;
              break;
            }
            case 'date':
              if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) r[f.key] = v;
              break;
            case 'month':
              if (typeof v === 'string' && /^\d{4}-\d{2}$/.test(v)) r[f.key] = v;
              break;
            case 'cpf': {
              const d = String(v).replace(/\D/g, '');
              if (d.length === 11) r[f.key] = d;
              break;
            }
            case 'cep': {
              const d = String(v).replace(/\D/g, '');
              if (d.length === 8) r[f.key] = d;
              break;
            }
            default:
              if (typeof v === 'string') {
                const max = f.type === 'textarea' ? 6000 : 300;
                const s = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
                if (s) r[f.key] = s;
              }
          }
        }
        return r;
      };
      const raw = src[grp.key];
      if (grp.repeat) {
        const items = (Array.isArray(raw) ? raw : []).slice(0, 80).map(clean).filter((x) => Object.keys(x).length > 0);
        if (items.length) out[grp.key] = items;
      } else {
        const c = clean(raw);
        if (Object.keys(c).length) out[grp.key] = c;
      }
    }
  }
  return out;
}

/** Validação de CPF (dígitos verificadores). */
export function validCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}
