'use client';

import { useId, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { UF, type FieldDef, type FormValue, type GroupDef, type SectionDef } from '@/lib/clinical/schema';
import type { IconName } from '@/lib/domain/types';

/**
 * Formulário montado a partir do esquema clínico: listas suspensas, caixas de seleção
 * em "chips", listas repetíveis (medicações, cirurgias, internações…) e máscaras.
 */

type Obj = Record<string, unknown>;

const mask = (type: string, v: string) => {
  const d = v.replace(/\D/g, '');
  if (type === 'cpf') return d.slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  if (type === 'cep') return d.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
  if (type === 'tel') return d.slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
  return v;
};

function Field({ f, value, onChange, readOnly, idp }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void; readOnly: boolean; idp: string }) {
  const id = `${idp}-${f.key}`;
  const ro = readOnly || !!f.readOnly;
  const cls = `sx-field span-${f.span ?? 1} ${f.type === 'multi' ? 'is-multi' : ''}`;
  const hint = f.hint ? <span className="sx-hint">{f.hint}</span> : null;

  if (f.type === 'check') {
    return (
      <label className={`${cls} sx-switch`}>
        <input type="checkbox" checked={value === true} disabled={ro} onChange={(e) => onChange(e.target.checked || undefined)} />
        <span className="sx-switch-ui" aria-hidden="true" />
        <span>{f.label}</span>
      </label>
    );
  }

  if (f.type === 'multi') {
    const sel = new Set(Array.isArray(value) ? (value as string[]) : []);
    return (
      <fieldset className={cls}>
        <legend>{f.label}</legend>
        <div className="sx-chips">
          {(f.options ?? []).map((o) => (
            <label key={o} className={`sx-chip ${sel.has(o) ? 'is-on' : ''}`}>
              <input type="checkbox" checked={sel.has(o)} disabled={ro} onChange={() => { const n = new Set(sel); if (n.has(o)) n.delete(o); else n.add(o); onChange(n.size ? [...n] : undefined); }} />
              {sel.has(o) && <Icon name="check" size={14} />}{o}
            </label>
          ))}
        </div>
        {hint}
      </fieldset>
    );
  }

  const common = { id, disabled: ro, 'aria-describedby': f.hint ? `${id}-h` : undefined, required: f.required };
  let input: React.ReactNode;
  if (f.type === 'select' || f.type === 'uf') {
    input = (
      <select {...common} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">Selecione…</option>
        {(f.type === 'uf' ? UF : f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  } else if (f.type === 'textarea') {
    input = <textarea {...common} rows={4} value={typeof value === 'string' ? value : ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value || undefined)} />;
  } else {
    const listId = f.suggestions ? `${id}-list` : undefined;
    const t = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'month' ? 'month' : f.type === 'email' ? 'email' : 'text';
    const shown = f.type === 'cpf' || f.type === 'cep' || f.type === 'tel' ? mask(f.type, String(value ?? '')) : value === undefined || value === null ? '' : String(value);
    input = (
      <>
        <input {...common} type={t} inputMode={f.type === 'cpf' || f.type === 'cep' ? 'numeric' : f.type === 'tel' ? 'tel' : undefined} value={shown} placeholder={f.placeholder} list={listId} step={f.type === 'number' ? 'any' : undefined}
          onChange={(e) => { const raw = e.target.value; onChange(raw === '' ? undefined : f.type === 'number' ? Number(raw) : f.type === 'cpf' || f.type === 'cep' ? raw.replace(/\D/g, '') : f.type === 'tel' ? mask('tel', raw) : raw); }} />
        {listId && <datalist id={listId}>{f.suggestions!.map((s) => <option key={s} value={s} />)}</datalist>}
      </>
    );
  }
  return (
    <div className={cls}>
      <label htmlFor={id}>{f.label}{f.required && <span className="sx-req" aria-hidden="true"> *</span>}</label>
      {input}
      {f.hint && <span className="sx-hint" id={`${id}-h`}>{f.hint}</span>}
    </div>
  );
}

function Group({ g, value, onChange, role, readOnly }: { g: GroupDef; value: unknown; onChange: (v: unknown) => void; role: 'paciente' | 'medico'; readOnly: boolean }) {
  const idp = useId();
  const fields = g.fields.filter((f) => !f.doctorOnly || role === 'medico');
  const [open, setOpen] = useState<number | null>(null);

  if (!g.repeat) {
    const obj = (value && typeof value === 'object' ? value : {}) as Obj;
    return (
      <div className="sx-group">
        <h3>{g.label}</h3>
        {g.intro && <p className="sx-intro">{g.intro}</p>}
        <div className="sx-grid">
          {fields.map((f) => <Field key={f.key} f={f} idp={idp} readOnly={readOnly} value={obj[f.key]} onChange={(v) => { const n = { ...obj }; if (v === undefined) delete n[f.key]; else n[f.key] = v; onChange(Object.keys(n).length ? n : undefined); }} />)}
        </div>
      </div>
    );
  }

  const items = (Array.isArray(value) ? value : []) as Obj[];
  const setItems = (n: Obj[]) => onChange(n.length ? n : undefined);
  return (
    <div className="sx-group">
      <h3>{g.label} <span className="sx-count">{items.length}</span></h3>
      {g.intro && <p className="sx-intro">{g.intro}</p>}
      <ul className="sx-items">
        {items.map((it, i) => {
          const title = (g.summary ?? []).map((k) => it[k]).filter(Boolean).map((x) => (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) ? new Date(x + 'T12:00:00').toLocaleDateString('pt-BR') : String(x))).join(' · ') || 'Novo item';
          const isOpen = open === i;
          return (
            <li key={i} className={`sx-item ${isOpen ? 'is-open' : ''}`}>
              <div className="sx-item-head">
                <button type="button" className="sx-item-toggle" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                  <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                  <span>{title}</span>
                </button>
                {!readOnly && <button type="button" className="sx-icon-btn" aria-label={`Remover ${title}`} onClick={() => { setItems(items.filter((_, j) => j !== i)); setOpen(null); }}><Icon name="trash" size={16} /></button>}
              </div>
              {isOpen && (
                <div className="sx-grid">
                  {fields.map((f) => <Field key={f.key} f={f} idp={`${idp}-${i}`} readOnly={readOnly} value={it[f.key]} onChange={(v) => { const n = [...items]; const o = { ...it }; if (v === undefined) delete o[f.key]; else o[f.key] = v; n[i] = o; setItems(n); }} />)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {!readOnly && <button type="button" className="sx-add" onClick={() => { setItems([...items, {}]); setOpen(items.length); }}><Icon name="plus" size={16} /> {g.addLabel || 'Adicionar'}</button>}
    </div>
  );
}

const ICON: Record<string, IconName> = { user: 'user', pin: 'pin', users: 'users', shield: 'shield', alert: 'alert', heart: 'heart', pill: 'pill', surgery: 'surgery', leaf: 'leaf', stethoscope: 'stethoscope' };

export function FormRenderer({ schema, value, onChange, role, readOnly = false, only }: { schema: SectionDef[]; value: FormValue; onChange: (v: FormValue) => void; role: 'paciente' | 'medico'; readOnly?: boolean; only?: string }) {
  return (
    <div className="sx-form">
      {schema.filter((s) => !only || s.key === only).map((s) => (
        <section key={s.key} className="sx-section" aria-labelledby={`sec-${s.key}`}>
          <header className="sx-section-head">
            <span className="sx-section-icon"><Icon name={ICON[s.icon] || 'file'} size={20} /></span>
            <div>
              <h2 id={`sec-${s.key}`}>{s.title}</h2>
              {s.intro && <p>{s.intro}</p>}
            </div>
          </header>
          {s.groups.map((g) => (
            <Group key={g.key} g={g} role={role} readOnly={readOnly} value={value[g.key]} onChange={(v) => { const n = { ...value }; if (v === undefined) delete n[g.key]; else n[g.key] = v as FormValue[string]; onChange(n); }} />
          ))}
        </section>
      ))}
    </div>
  );
}
