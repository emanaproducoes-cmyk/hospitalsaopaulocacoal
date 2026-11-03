import type { IconName } from '@/lib/domain/types';
import { Icon } from './Icon';

/**
 * Ilustração PROVISÓRIA da marca, usada no lugar de fotos reais ainda não autorizadas.
 * Quando a foto real existir, troque <Artwork/> por <Image src="/images/..."/> com o mesmo `alt`.
 */
const presets: Record<string, { icon: IconName; a: string; b: string; label: string }> = {
  hero: { icon: 'heart', a: '#2FA441', b: '#294197', label: 'Foto do hero' },
  recepcao: { icon: 'users', a: '#DCEFE0', b: '#C9D5F2', label: 'Recepção' },
  equipe: { icon: 'doctor', a: '#C9D5F2', b: '#DCEFE0', label: 'Equipe' },
  cirurgia: { icon: 'surgery', a: '#D3E3F7', b: '#E4F2E7', label: 'Centro cirúrgico' },
  tomografia: { icon: 'scan', a: '#E1E8F8', b: '#D7EEDC', label: 'Diagnóstico' },
  maternidade: { icon: 'baby', a: '#E7F4EA', b: '#DCE4F8', label: 'Maternidade' },
  comunidade: { icon: 'users', a: '#DDEFE1', b: '#E2E7F7', label: 'Comunidade' },
  pediatria: { icon: 'child', a: '#E3F1E6', b: '#D8E2F7', label: 'Pediatria' },
  institucional: { icon: 'hotel', a: '#D6E0F6', b: '#DFF0E3', label: 'Institucional' },
  'campanha-azul': { icon: 'heart', a: '#BFD0F3', b: '#E5ECFB', label: 'Novembro Azul' },
  'campanha-rosa': { icon: 'heart', a: '#F6D9E4', b: '#FBEFF4', label: 'Outubro Rosa' },
  doacao: { icon: 'drop', a: '#F4DADA', b: '#E7EDF9', label: 'Doação de sangue' },
  hospital: { icon: 'hotel', a: '#D9E3F7', b: '#E1F1E5', label: 'Fachada do hospital' },
};

export function Artwork({ name, ratio = '4 / 3', className, showTag = true, alt }: { name: string; ratio?: string; className?: string; showTag?: boolean; alt?: string }) {
  const p = presets[name] ?? presets.institucional;
  const id = `art-${name}`;
  return (
    <div className={`artwork ${className ?? ''}`} style={{ aspectRatio: ratio }} role={alt ? 'img' : undefined} aria-label={alt} aria-hidden={alt ? undefined : true}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={p.a} />
            <stop offset="1" stopColor={p.b} />
          </linearGradient>
          <radialGradient id={`${id}-r`} cx="0.78" cy="0.2" r="0.7">
            <stop offset="0" stopColor="#fff" stopOpacity=".75" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#${id}-g)`} />
        <rect width="400" height="300" fill={`url(#${id}-r)`} />
        <g fill="none" stroke="#fff" strokeOpacity=".55">
          <circle cx="330" cy="250" r="90" />
          <circle cx="330" cy="250" r="140" />
          <circle cx="330" cy="250" r="190" />
          <circle cx="60" cy="40" r="70" strokeOpacity=".35" />
        </g>
      </svg>
      <span className="artwork-icon">
        <Icon name={p.icon} size={34} />
      </span>
      {showTag && <span className="artwork-tag">Foto real a inserir · {p.label}</span>}
    </div>
  );
}
