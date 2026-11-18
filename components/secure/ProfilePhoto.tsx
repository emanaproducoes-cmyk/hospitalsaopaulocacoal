'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { sx } from './client';

const initials = (name: string) => name.replace(/^(dra?\.?)\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

/** Reduz a foto no navegador (corte quadrado, 320 px, JPEG) antes de enviar. */
async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Envie uma foto JPG, PNG ou WEBP.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Foto grande demais.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('Não foi possível ler a foto.')); i.src = url; });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const c = document.createElement('canvas');
    c.width = c.height = 320;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Não foi possível preparar a foto.');
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 320, 320);
    return await new Promise<Blob>((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error('Não foi possível preparar a foto.'))), 'image/jpeg', 0.86));
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Círculo com a foto do usuário logado, ao lado do logo. Clique para trocar. */
export function MyPhoto({ name, onMessage }: { name: string; onMessage: (kind: 'ok' | 'erro', text: string) => void }) {
  const [has, setHas] = useState(false);
  const [v, setV] = useState(0);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { sx<{ user: { hasPhoto?: boolean } | null }>('auth/me').then((m) => setHas(!!m.user?.hasPhoto)).catch(() => {}); }, []);

  const pick = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      const blob = await shrink(f);
      const fd = new FormData();
      fd.append('foto', new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
      await sx('perfil/foto', { form: fd });
      setHas(true); setV((x) => x + 1);
      onMessage('ok', 'Foto de perfil atualizada.');
    } catch (e) {
      onMessage('erro', (e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <button type="button" className={`sx-me ${busy ? 'is-busy' : ''}`} onClick={() => input.current?.click()} title={has ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'} aria-label={has ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'}>
      {has
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={`/api/secure/perfil/foto?v=${v}`} alt="" />
        : <span>{initials(name)}</span>}
      <i aria-hidden="true"><Icon name="edit" size={11} /></i>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </button>
  );
}

/** Foto (ou iniciais) de um paciente, vista pelo médico com o prontuário aberto. */
export function PatientPhoto({ number, name, has, size = 'lg' }: { number: string; name: string; has: boolean; size?: 'lg' | 'md' }) {
  const [ok, setOk] = useState(has);
  useEffect(() => setOk(has), [has, number]);
  return (
    <span className={`sx-avatar is-${size} ${ok ? 'has-photo' : ''}`}>
      {ok
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={`/api/secure/medico/prontuario/${number}/foto`} alt={`Foto de ${name}`} onError={() => setOk(false)} />
        : initials(name)}
    </span>
  );
}
