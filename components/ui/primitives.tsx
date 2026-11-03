import Image from 'next/image';
import Link from 'next/link';
import { SHOW_VALIDATION_FLAGS } from '@/lib/data/site';
import type { IconName } from '@/lib/domain/types';
import { Icon } from './Icon';

/* ---------- Logo (assinaturas oficiais extraídas do PDF da marca) ---------- */
type LogoVariant = 'header' | 'completa' | 'cacoal' | 'white' | 'simbolo' | 'simbolo-white';
const logos: Record<LogoVariant, { src: string; w: number; h: number; alt: string }> = {
  header: { src: '/brand/logo-hospital-sao-paulo.png', w: 930, h: 323, alt: 'Hospital São Paulo — página inicial' },
  completa: { src: '/brand/logo-hbsp-completa.svg', w: 929, h: 403, alt: 'Hospital Beneficente São Paulo de Cacoal' },
  cacoal: { src: '/brand/logo-hbsp-reduzida-cacoal.svg', w: 930, h: 400, alt: 'Hospital São Paulo de Cacoal' },
  white: { src: '/brand/logo-hbsp-white.png', w: 930, h: 400, alt: 'Hospital São Paulo de Cacoal' },
  simbolo: { src: '/brand/simbolo-hbsp.png', w: 930, h: 229, alt: 'HBSP' },
  'simbolo-white': { src: '/brand/simbolo-hbsp-white.svg', w: 930, h: 229, alt: 'HBSP' },
};

export function Logo({ variant = 'header', height = 48, priority = false, className }: { variant?: LogoVariant; height?: number; priority?: boolean; className?: string }) {
  const l = logos[variant];
  const width = Math.round((l.w / l.h) * height);
  return <Image src={l.src} alt={l.alt} width={width} height={height} priority={priority} unoptimized className={className} />;
}

/* ---------- Selo "a validar" ---------- */
export function PendingBadge({ text = 'a validar' }: { text?: string }) {
  if (!SHOW_VALIDATION_FLAGS) return null;
  return (
    <span className="pending" title="Informação a validar com o hospital antes da publicação">
      <Icon name="info" size={13} /> {text}
    </span>
  );
}

/* ---------- Cabeçalho de seção ---------- */
export function SectionHeading({ eyebrow, title, intro, align = 'left', id }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode; align?: 'left' | 'center'; id?: string }) {
  return (
    <div className={`section-heading ${align === 'center' ? 'is-center' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id}>{title}</h2>
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}

/* ---------- Botões / links ---------- */
type BtnProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'alert' | 'white' | 'green';
  icon?: IconName;
  iconRight?: IconName;
  external?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-describedby'?: string;
  onClick?: () => void;
};

export function ButtonLink({ href, children, variant = 'primary', icon, iconRight, external, size = 'md', className, onClick, ...rest }: BtnProps) {
  const cls = `btn btn-${variant} btn-${size}${className ? ' ' + className : ''}`;
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 18 : 20} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={18} />}
    </>
  );
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    const isHttp = href.startsWith('http');
    return (
      <a href={href} className={cls} onClick={onClick} {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})} aria-describedby={rest['aria-describedby']}>
        {inner}
        {isHttp && <span className="sr-only"> (abre em nova aba)</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} onClick={onClick} aria-describedby={rest['aria-describedby']}>
      {inner}
    </Link>
  );
}

/* ---------- Migalhas de pão ---------- */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const all = [{ label: 'Início', href: '/' }, ...items];
  return (
    <nav aria-label="Você está em" className="breadcrumbs">
      <ol>
        {all.map((it, i) => (
          <li key={i}>
            {it.href && i < all.length - 1 ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------- JSON-LD ---------- */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/* ---------- Cabeçalho de página interna ---------- */
export function PageHero({ eyebrow, title, intro, crumbs, children, tone = 'blue', art }: { eyebrow?: string; title: string; intro?: React.ReactNode; crumbs: { label: string; href?: string }[]; children?: React.ReactNode; tone?: 'blue' | 'light' | 'alert'; art?: React.ReactNode }) {
  return (
    <header className={`page-hero tone-${tone}`}>
      <div className="container page-hero-grid">
        <div>
          <Breadcrumbs items={crumbs} />
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {intro && <p className="lead">{intro}</p>}
          {children && <div className="page-hero-actions">{children}</div>}
        </div>
        {art && <div className="page-hero-art">{art}</div>}
      </div>
    </header>
  );
}
