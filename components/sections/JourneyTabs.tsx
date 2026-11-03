'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/lib/domain/types';

type Step = { icon: IconName; title: string; text: string; link?: { label: string; href: string } };
const tabs: { id: string; label: string; intro: string; steps: Step[] }[] = [
  {
    id: 'antes',
    label: 'Antes',
    intro: 'Prepare-se com tranquilidade: saiba o que levar e como chegar.',
    steps: [
      { icon: 'calendar', title: 'Agende', text: 'Use o assistente ou fale com a central pelo WhatsApp.', link: { label: 'Agendar agora', href: '/agendar' } },
      { icon: 'file', title: 'Separe os documentos', text: 'Documento com foto, cartão do convênio, pedido médico e exames anteriores.', link: { label: 'Ver lista completa', href: '/pacientes-e-acompanhantes#documentos' } },
      { icon: 'scan', title: 'Confira o preparo', text: 'Alguns exames pedem jejum ou cuidados especiais.', link: { label: 'Ver preparo de exames', href: '/exames' } },
      { icon: 'route', title: 'Planeje a chegada', text: 'Chegue com 15 minutos de antecedência.', link: { label: 'Como chegar', href: '/contato' } },
    ],
  },
  {
    id: 'durante',
    label: 'Durante',
    intro: 'Você e sua família informados em cada etapa.',
    steps: [
      { icon: 'users', title: 'Acolhimento', text: 'A recepção confirma seus dados e orienta os próximos passos.' },
      { icon: 'doctor', title: 'Atendimento', text: 'Converse com o profissional, tire dúvidas e anote orientações.' },
      { icon: 'bed', title: 'Internação', text: 'Entenda regras de acompanhante, visitas e rotina do quarto.', link: { label: 'Entender a internação', href: '/servicos/internacao' } },
      { icon: 'shield', title: 'Segurança do paciente', text: 'Confirme seu nome na pulseira e pergunte sempre que tiver dúvidas.' },
    ],
  },
  {
    id: 'depois',
    label: 'Depois',
    intro: 'O cuidado continua depois da alta.',
    steps: [
      { icon: 'file', title: 'Orientações de alta', text: 'Receitas, cuidados em casa e sinais de alerta explicados por escrito.' },
      { icon: 'calendar', title: 'Retorno', text: 'Agende o retorno com o mesmo profissional.', link: { label: 'Agendar retorno', href: '/agendar?tipo=retorno' } },
      { icon: 'microscope', title: 'Resultados de exames', text: 'Retire ou receba seus resultados conforme orientação.' },
      { icon: 'chat', title: 'Conte como foi', text: 'Sua opinião ajuda a melhorar o cuidado.', link: { label: 'Enviar feedback', href: '/ouvidoria' } },
    ],
  },
];

/** Abas ARIA (padrão APG): setas, Home/End, ativação automática. */
export function JourneyTabs() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    else return;
    e.preventDefault();
    setActive(n);
    refs.current[n]?.focus();
  };

  return (
    <div className="journey">
      <div role="tablist" aria-label="Etapas do atendimento" className="journey-tabs">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === i}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className="journey-tab"
          >
            <span className="journey-num">{i + 1}</span>
            <span>{t.label}<span className="jt-extra"> do atendimento</span></span>
          </button>
        ))}
        <span className="journey-ink" style={{ transform: `translateX(${active * 100}%)` }} aria-hidden="true" />
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== i} className="journey-panel" tabIndex={0}>
          <p className="journey-intro">{t.intro}</p>
          <ol className="journey-steps">
            {t.steps.map((s) => (
              <li key={s.title}>
                <span className="js-icon"><Icon name={s.icon} size={24} /></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                {s.link && <Link href={s.link.href} className="text-link">{s.link.label} <Icon name="arrow-right" size={16} /></Link>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
