import type { IconName } from '@/lib/domain/types';

/** Ícones de traço consistente (24×24, stroke 1.75). Decorativos por padrão. */
const paths: Record<IconName, React.ReactNode> = {
  emergency: (<><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><path d="M12 7.5v9M7.5 12h9" strokeWidth={2.1} /></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17M8 14h3M8 17h6" /></>),
  microscope: (<><path d="M9.5 3.5l3.6 1.5-3.4 8-3.6-1.5Z" /><path d="M7.8 12.7l-.9 2" /><path d="M14 9.8a5.6 5.6 0 0 1-1.2 9.7" /><path d="M5 20.5h14M8.5 17.5h6" /><circle cx="12.2" cy="8" r=".6" /></>),
  doctor: (<><circle cx="12" cy="7.5" r="3.5" /><path d="M5 21v-1.5A6.5 6.5 0 0 1 11.5 13h1a6.5 6.5 0 0 1 6.5 6.5V21" /><path d="M9 14.5v2.5a2 2 0 0 0 4 0M15.5 14v3" /><circle cx="15.5" cy="18" r="1" /></>),
  surgery: (<><path d="M3.5 20.5 11 13" strokeWidth={2} /><path d="M11 13 18.6 5.4c1.4 1.4 1.7 4.3-.4 6.6-1.7 1.8-4.2 2.6-6.1 2.4Z" /><path d="M9.2 14.8l1.6 1.6" /></>),
  bed: (<><path d="M3 18V7M3 14h18v4M21 14v-2.5A3.5 3.5 0 0 0 17.5 8H11v6" /><circle cx="7" cy="11" r="2" /></>),
  baby: (<><circle cx="12" cy="8" r="4.5" /><path d="M10.5 8h.01M13.5 8h.01M10.8 10.2a2 2 0 0 0 2.4 0" /><path d="M7 21v-2a5 5 0 0 1 10 0v2" /></>),
  child: (<><circle cx="12" cy="5.5" r="2.5" /><path d="M8 21l1.5-7L6 11l2-2 4 2 4-2 2 2-3.5 3L16 21M12 14v3" /></>),
  siren: (<><path d="M7 18v-5.5a5 5 0 0 1 10 0V18" /><path d="M5 18h14v3H5Z" /><path d="M12 2.5v2M4.6 5.6l1.4 1.4M19.4 5.6 18 7M2.5 12.5h2M19.5 12.5h2" /><path d="M10 13.5a2 2 0 0 1 2-2" /></>),
  'test-tube': (<><path d="M14.5 3.5 20.5 9.5" /><path d="M16 5 7 14a3.2 3.2 0 0 0 4.5 4.5L20.5 9.5" /><path d="M9.2 11.8h7" /><path d="M9 15.2h.01M11.5 15.6h.01" /></>),
  stethoscope: (<><path d="M5 3.5v5a4.5 4.5 0 0 0 9 0v-5" /><path d="M9.5 13v2.5a4.5 4.5 0 0 0 9 0V13" /><circle cx="18.5" cy="11" r="2" /></>),
  heart: (<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />),
  scan: (<><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="3.5" /></>),
  phone: (<path d="M5 3.5h3.2l1.6 4-2.1 1.3a11 11 0 0 0 5.5 5.5l1.3-2.1 4 1.6V17A3 3 0 0 1 15.5 20 13.5 13.5 0 0 1 4 8.5 3 3 0 0 1 5 3.5Z" />),
  whatsapp: (<><path d="M4 20l1.2-3.7A8 8 0 1 1 8 19Z" /><path d="M9 9.2c.2 2 2.1 4 4.4 4.6l1-1.2 1.8.8c-.2 1.2-1 1.8-2.2 1.8C11 15.2 8.8 13 8.6 10.2c0-1.2.6-2 1.8-2.2l.8 1.8Z" /></>),
  pin: (<><path d="M12 21s-6.5-5.5-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21Z" /><circle cx="12" cy="10" r="2.4" /></>),
  target: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>),
  eye: (<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>),
  robot: (<><path d="M12 3v3" /><circle cx="12" cy="2.6" r="0.9" /><rect x="5" y="6" width="14" height="10" rx="3" /><circle cx="9.5" cy="11" r="1.2" /><circle cx="14.5" cy="11" r="1.2" /><path d="M8 20h8M10 16v4M14 16v4M3 10v3M21 10v3" /></>),
  sparkle: (<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8ZM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" />),
  recovery: (<><path d="M4 12a8 8 0 0 1 14.3-4.9" /><path d="M18.5 3.5v4h-4" /><path d="M20 12a8 8 0 0 1-14.3 4.9" /><path d="M5.5 20.5v-4h4" /></>),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>),
  shield: (<><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z" /><path d="m9 12 2 2 4-4" /></>),
  users: (<><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20v-1a5.5 5.5 0 0 1 11 0v1M16 5a3 3 0 0 1 0 6M17.5 14.2A5 5 0 0 1 20.5 19v1" /></>),
  file: (<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>),
  chat: (<path d="M5 18.5 3.5 21l.8-4A8 8 0 1 1 8 19.5Z" />),
  'arrow-right': (<path d="M5 12h14M13 6l6 6-6 6" />),
  'arrow-left': (<path d="M19 12H5M11 6l-6 6 6 6" />),
  close: (<path d="M6 6l12 12M18 6 6 18" />),
  menu: (<path d="M4 7h16M4 12h16M4 17h10" />),
  play: (<path d="M8 5.5v13l10.5-6.5Z" />),
  pause: (<path d="M8 5v14M16 5v14" />),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8h.01" /></>),
  check: (<path d="m5 12.5 4.5 4.5L19 7.5" />),
  star: (<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8Z" />),
  hotel: (<><path d="M3 20h18M5 20V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" /><path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01M10 20v-4h4v4" /></>),
  lab: (<><path d="M9 3h6M10 3v6L4.8 18.2A1.9 1.9 0 0 0 6.5 21h11a1.9 1.9 0 0 0 1.7-2.8L14 9V3" /><path d="M7 15h10" /></>),
  accessibility: (<><circle cx="12" cy="4.5" r="1.8" /><path d="M5 8.5 12 10l7-1.5M12 10v4.5M9 21l3-6.5 3 6.5" /></>),
  instagram: (<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.8" /><path d="M17.2 6.8h.01" /></>),
  facebook: (<path d="M14 21v-7.5h2.6l.4-3H14V8.7c0-.9.3-1.5 1.6-1.5H17V4.6A20 20 0 0 0 14.8 4.5C12.6 4.5 11 5.8 11 8.3v2.2H8.5v3H11V21" />),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>),
  route: (<><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" /><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" /></>),
  leaf: (<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15M5 19l7-7" />),
  drop: (<path d="M12 3.5S6 10 6 14a6 6 0 0 0 12 0c0-4-6-10.5-6-10.5Z" />),
  plus: (<path d="M12 5v14M5 12h14" />),
  minus: (<path d="M5 12h14" />),
  contrast: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" /></>),
  external: (<><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></>),
};

export function Icon({ name, size = 22, label, className }: { name: IconName; size?: number; label?: string; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
