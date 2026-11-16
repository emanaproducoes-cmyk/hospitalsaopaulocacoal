'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { TrackedButton } from '@/components/ui/Tracked';
import { Tooltip } from '@/components/ui/Tooltip';
import { asset } from '@/lib/asset';
import { track } from '@/lib/integrations/analytics';
import Link from 'next/link';
import { whatsappLink } from '@/lib/integrations/whatsapp';
import type { IconName } from '@/lib/domain/types';

const benefits: { icon: IconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Mais precisão', text: 'Instrumentos articulados giram além do alcance do punho humano e chegam a regiões delicadas com mais controle.' },
  { icon: 'eye', title: 'Visão ampliada', text: 'O cirurgião enxerga o campo operatório em alta definição e 3D, com imagem ampliada em muitas vezes.' },
  { icon: 'sparkle', title: 'Movimentos controlados', text: 'O sistema filtra o tremor natural das mãos e reproduz cada gesto do cirurgião em escala reduzida.' },
  { icon: 'recovery', title: 'Recuperação mais tranquila', text: 'Incisões pequenas tendem a significar menos dor, menos sangramento e retorno mais rápido à rotina.' },
];

const steps = [
  { n: '01', title: 'Avaliação e indicação', text: 'Na consulta, o cirurgião avalia o seu caso e explica se a técnica robótica é a melhor opção, comparando com a cirurgia convencional ou por vídeo.' },
  { n: '02', title: 'Cirurgia no console', text: 'Sentado no console, o cirurgião comanda os braços robóticos em tempo real. O robô não decide nem age sozinho: ele executa os movimentos do médico.' },
  { n: '03', title: 'Recuperação acompanhada', text: 'Equipe de enfermagem e médica acompanha o pós-operatório, com orientações claras para a alta e o retorno às atividades.' },
];

const areas = ['Urologia', 'Ginecologia', 'Cirurgia geral e do aparelho digestivo', 'Coloproctologia', 'Hérnias da parede abdominal', 'Cirurgia oncológica'];

const photos = [
  { src: '/images/robotica/r4', alt: 'Braços robóticos com instrumentos finos posicionados sobre o paciente, sob o foco cirúrgico', cap: 'Instrumentos de poucos milímetros' },
  { src: '/images/robotica/r1', alt: 'Profissional da equipe posicionando os braços do robô cirúrgico', cap: 'Preparo pela equipe' },
  { src: '/images/robotica/r2', alt: 'Quatro braços robóticos numerados sobre a mesa cirúrgica', cap: 'Quatro braços articulados' },
  { src: '/images/robotica/r3', alt: 'Sala cirúrgica com braços robóticos e iluminação azulada', cap: 'Sala integrada' },
  { src: '/images/robotica/r5', alt: 'Cirurgia robótica em andamento em sala com monitores', cap: 'Imagem em tempo real' },
  { src: '/images/robotica/r6', alt: 'Detalhe dos braços robóticos em ambiente cirúrgico', cap: 'Tecnologia de ponta' },
];

const faq = [
  { q: 'O robô opera sozinho?', a: 'Não. Quem opera é sempre o cirurgião, que comanda cada movimento pelo console. O robô é uma ferramenta que amplia a precisão e a visão do médico.' },
  { q: 'Toda cirurgia pode ser feita com robô?', a: 'Não. A indicação depende do tipo de cirurgia, do seu quadro de saúde e da avaliação do cirurgião, que explica as opções na consulta.' },
  { q: 'Meu convênio cobre a cirurgia robótica?', a: 'A cobertura varia conforme o plano e o procedimento. A central confirma as condições para particular e convênio antes do agendamento.' },
];

export function RoboticSurgery({ headingLevel = 2, showPageLink = true }: { headingLevel?: 1 | 2; showPageLink?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const H = headingLevel === 1 ? 'h1' : 'h2';

  const play = () => {
    const v = video.current;
    if (!v) return;
    v.muted = false;
    v.play().then(() => setPlaying(true)).catch(() => { v.muted = true; v.play().then(() => setPlaying(true)).catch(() => {}); });
    track('content_engagement', { origin: 'robotic-surgery', action: 'video_play' });
  };

  return (
    <section className="robotic" aria-labelledby="robotic-title">
      <div className="robotic-glow" aria-hidden="true" />
      <div className="container">
        <div className="robotic-intro">
          <div className="robotic-copy">
            <p className="eyebrow on-dark">Cirurgia robótica · Sistema Toumai</p>
            <H id="robotic-title" className="robotic-title">
              Tecnologia que transforma a cirurgia. <span>Cuidado que continua humano.</span>
            </H>
            <p className="robotic-lead">
              O Hospital São Paulo traz para Cacoal a cirurgia robótica: o cirurgião comanda braços robóticos de alta precisão a partir de um console, com visão ampliada do campo operatório. Para o paciente, isso pode significar cortes menores, menos dor e uma recuperação mais rápida.
              <Tooltip content="A cirurgia robótica é uma forma de cirurgia minimamente invasiva: em vez de um corte grande, são feitas pequenas incisões por onde entram a câmera e os instrumentos." label="O que é cirurgia minimamente invasiva?" />
            </p>
            <ul className="robotic-benefits">
              {benefits.map((b) => (
                <li key={b.title} className="robotic-benefit">
                  <span className="rb-icon"><Icon name={b.icon} size={22} /></span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="robotic-actions">
              <TrackedButton href="/agendar?especialidade=cirurgia-geral&origem=robotica" event="click_schedule" params={{ origin: 'robotic-surgery' }} icon="calendar" variant="white">Agendar avaliação</TrackedButton>
              <TrackedButton href={whatsappLink({ intent: 'cirurgia-robotica', origin: 'robotic-section', text: 'Olá! Quero saber mais sobre a cirurgia robótica no Hospital São Paulo.' })} event="click_whatsapp" params={{ origin: 'robotic-surgery' }} icon="whatsapp" variant="ghost" className="on-dark">Tirar dúvidas</TrackedButton>
            </div>
          </div>

          <figure className="robotic-video">
            <div className="rv-frame">
              <video ref={video} src={asset('/videos/cirurgia-robotica.mp4')} poster={asset('/videos/cirurgia-robotica-poster.webp')} playsInline preload="none" controls={playing} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} aria-label="Vídeo: a chegada da cirurgia robótica ao Hospital São Paulo de Cacoal (legendado)" />
              {!playing && (
                <button type="button" className="rv-play" onClick={play} aria-label="Assistir ao vídeo sobre a cirurgia robótica, 40 segundos, com legendas">
                  <span className="rv-play-btn"><Icon name="play" size={28} /></span>
                  <span className="rv-play-text">Assista · 0:40</span>
                </button>
              )}
            </div>
            <figcaption>Conheça o robô no nosso centro cirúrgico. Vídeo com legendas.</figcaption>
          </figure>
        </div>

        <div className="robotic-steps">
          <h3 className="robotic-sub">Como funciona, passo a passo</h3>
          <ol>
            {steps.map((s) => (
              <li key={s.n} className="robotic-step">
                <span className="rs-n" aria-hidden="true">{s.n}</span>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <ul className="robotic-mosaic" aria-label="Fotos da cirurgia robótica">
          {photos.map((p, i) => (
            <li key={p.src} className={`rm-${i}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(`${p.src}.webp`)} alt={p.alt} loading="lazy" />
              <span className="rm-cap">{p.cap}</span>
            </li>
          ))}
        </ul>

        <div className="robotic-bottom">
          <div className="robotic-areas">
            <h3 className="robotic-sub">Onde a cirurgia robótica pode ser indicada</h3>
            <ul className="robotic-chips">
              {areas.map((a) => <li key={a}>{a}</li>)}
            </ul>
            <p className="robotic-note"><Icon name="info" size={18} /> A indicação é sempre individual e feita pelo cirurgião, depois da avaliação do seu caso.</p>
            {showPageLink && (
              <Link className="robotic-link" href="/cirurgia-robotica">Saiba tudo sobre a cirurgia robótica <Icon name="arrow-right" size={16} /></Link>
            )}
          </div>
          <div className="robotic-faq">
            <h3 className="robotic-sub">Perguntas frequentes</h3>
            {faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}<Icon name="plus" size={18} /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
