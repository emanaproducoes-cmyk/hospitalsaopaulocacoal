import Link from 'next/link';
import { site } from '@/lib/data/site';
import { services } from '@/lib/data/services';
import { specialties } from '@/lib/data/specialties';
import { doctors } from '@/lib/data/doctors';
import { Icon } from '@/components/ui/Icon';
import { PendingBadge, SectionHeading } from '@/components/ui/primitives';
import { Tooltip } from '@/components/ui/Tooltip';
import { TrackedButton, TrackedA } from '@/components/ui/Tracked';
import { Reveal } from '@/components/ui/Reveal';
import { whatsappLink } from '@/lib/integrations/whatsapp';

/* ======================= DECISÃO RÁPIDA ======================= */
const decisions = [
  { icon: 'emergency' as const, title: 'Estou com uma urgência', text: 'Endereço, rota e quando ligar 192.', href: '/pronto-atendimento', tone: 'alert', event: 'click_emergency' as const },
  { icon: 'calendar' as const, title: 'Quero agendar', text: 'Consulta ou retorno em 4 passos.', href: '/agendar?origem=home-decisao', tone: 'blue', event: 'click_schedule' as const },
  { icon: 'scan' as const, title: 'Preciso fazer um exame', text: 'Preparo, documentos e agendamento.', href: '/exames', tone: 'green', event: 'view_exam_prep' as const },
  { icon: 'doctor' as const, title: 'Busco um médico', text: 'Por nome ou especialidade.', href: '/medicos', tone: 'navy', event: 'search_doctor' as const },
];

export function QuickDecision() {
  return (
    <section className="quick" aria-labelledby="quick-title">
      <div className="container">
        <h2 id="quick-title" className="sr-only">Como podemos ajudar agora?</h2>
        <ul className="quick-grid">
          {decisions.map((d, i) => (
            <Reveal as="li" key={d.href} delay={i * 70}>
              <Link href={d.href} className={`quick-card tone-${d.tone}`}>
                <span className="quick-icon"><Icon name={d.icon} size={26} /></span>
                <span className="quick-text">
                  <strong>{d.title}</strong>
                  <span>{d.text}</span>
                </span>
                <Icon name="arrow-right" size={20} className="quick-arrow" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ======================= PRONTO ATENDIMENTO ======================= */
export function EmergencyPanel({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`emergency ${compact ? 'is-compact' : ''}`} aria-labelledby="pa-title">
      <div className="container emergency-grid">
        <div className="emergency-main">
          <p className="eyebrow on-dark">Pronto atendimento</p>
          <h2 id="pa-title">Precisa de atendimento agora?</h2>
          <p className="emergency-status">
            <span className="pulse" aria-hidden="true" /> Aberto todos os dias · {site.emergency.hours.value} <PendingBadge />
          </p>
          <ul className="emergency-facts">
            <li><Icon name="pin" size={20} /><span><strong>{site.address.street}</strong><br />{site.address.district} · {site.address.city}/{site.address.state}</span></li>
            <li><Icon name="phone" size={20} /><span><strong>{site.contacts.scheduling.label}</strong><br />Central de atendimento</span></li>
            <li><Icon name="child" size={20} /><span><strong>{site.contacts.pediatricOnCall.label}</strong><br />Plantão pediátrico</span></li>
          </ul>
          <div className="emergency-actions">
            <TrackedButton href={site.address.mapsUrl} event="view_location" params={{ origin: 'pa-panel' }} variant="white" icon="route">Como chegar</TrackedButton>
            <TrackedButton href={`tel:${site.contacts.scheduling.tel}`} event="click_emergency" params={{ origin: 'pa-panel', action: 'call' }} variant="ghost" icon="phone" className="on-dark">Ligar para o hospital</TrackedButton>
          </div>
        </div>
        <aside className="emergency-samu" aria-labelledby="samu-title">
          <p className="samu-number" aria-hidden="true">192</p>
          <h3 id="samu-title">
            Risco de vida? Ligue 192 (SAMU)
            <Tooltip content="O SAMU é o serviço público de atendimento móvel de urgência. A equipe começa o cuidado no local e leva o paciente ao hospital mais adequado. A ligação é gratuita." label="O que é o SAMU?" />
          </h3>
          <p>Ligue <strong>antes</strong> de sair de casa se a pessoa:</p>
          <ul className="check-list">
            <li>está inconsciente ou com falta de ar intensa</li>
            <li>tem dor forte no peito</li>
            <li>apresenta sinais de AVC: boca torta, fraqueza de um lado, fala enrolada</li>
            <li>sofreu um acidente grave ou tem sangramento intenso</li>
          </ul>
          <TrackedButton href="tel:192" event="click_emergency" params={{ origin: 'pa-panel', action: 'samu' }} variant="alert" icon="phone">Ligar 192</TrackedButton>
        </aside>
      </div>
    </section>
  );
}

/* ======================= SERVIÇOS ======================= */
export function ServicesGrid() {
  return (
    <section className="section" aria-labelledby="services-title">
      <div className="container">
        <SectionHeading id="services-title" eyebrow="Nossos serviços" title="Estrutura completa para cada etapa do cuidado" intro="Do primeiro atendimento à alta, os serviços do HBSP trabalham juntos para que você não precise procurar em vários lugares." />
        <ul className="services-grid">
          {services.filter((s) => s.slug !== 'hotelaria').map((s, i) => (
            <Reveal as="li" key={s.slug} delay={(i % 3) * 70}>
              <article className="service-card">
                <span className="service-icon"><Icon name={s.icon} size={28} /></span>
                <h3>{s.name}</h3>
                <p>{s.short}</p>
                <Link href={s.cta.href} className="text-link" aria-describedby={`svc-hint-${s.slug}`}>
                  {s.cta.label} <Icon name="arrow-right" size={16} />
                </Link>
                <span id={`svc-hint-${s.slug}`} className="sr-only">{s.cta.hint}</span>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ======================= CONFIANÇA ======================= */
const timeline = [
  { year: '1975', title: 'Fundação', text: 'O Dr. Toshio Shiokawa inicia o hospital com 8 leitos, 5 consultórios e 3 médicos.' },
  { year: '1983', title: 'Primeira ampliação', text: '15 leitos, centro cirúrgico reestruturado, UTI com 3 leitos, laboratório, raio X e endoscopia.' },
  { year: '1996', title: 'Gestão colegiada', text: 'Administração passa a um grupo de nove médicos e um bioquímico, com nova ampliação.' },
  { year: '2026', title: 'Hospital Beneficente São Paulo', text: 'Nova identidade e um ecossistema digital para acompanhar você antes, durante e depois do atendimento.' },
];

export function TrustSection() {
  return (
    <section className="section trust" aria-labelledby="trust-title">
      <div className="container trust-grid">
        <div>
          <SectionHeading id="trust-title" eyebrow="Por que confiar" title={<>Cinco décadas de história, <span className="grad-text">um mesmo compromisso</span></>} intro="Nascemos pequenos, crescemos com a região e seguimos com o mesmo propósito: levar saúde, qualidade de vida e esperança a cada família." />
          <dl className="stats">
            <div><dt>Ano de fundação</dt><dd>{site.foundedYear}</dd></div>
            <div><dt>Especialidades e áreas</dt><dd>{specialties.length}</dd></div>
            <div><dt>Médicos com perfil publicado</dt><dd>{doctors.length}</dd></div>
          </dl>
          <p className="source-note">Fonte: hmsaopaulo.com.br, consultado em 02/11/2026. Leitos, atendimentos/ano e certificações: <PendingBadge text="dados a validar" /></p>
          <blockquote className="quote">
            <p>“Cada pessoa que entra aqui é recebida como gostaríamos que a nossa família fosse recebida.”</p>
            <footer>Princípio de cuidado do HBSP <PendingBadge text="frase a aprovar" /></footer>
          </blockquote>
        </div>
        <ol className="timeline" aria-label="Linha do tempo">
          {timeline.map((t, i) => (
            <Reveal as="li" key={t.year} delay={i * 80}>
              <span className="tl-year">{t.year}</span>
              <div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ======================= CTA FINAL ======================= */
export function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-title">
      <div className="container final-cta-inner">
        <div>
          <h2 id="final-title">Vamos cuidar de você?</h2>
          <p>Fale com a nossa central: tiramos dúvidas, orientamos sobre especialidades e agendamos o seu atendimento.</p>
        </div>
        <div className="final-actions">
          <TrackedButton href="/agendar?origem=home-final" event="click_schedule" params={{ origin: 'home-final' }} variant="white" icon="calendar" size="lg">Agendar consulta</TrackedButton>
          <TrackedButton href={whatsappLink({ intent: 'Dúvida', origin: 'home-final' })} event="click_whatsapp" params={{ origin: 'home-final' }} variant="green" icon="whatsapp" size="lg">Falar no WhatsApp</TrackedButton>
          <Link href="/ouvidoria" className="text-link on-dark">Deixar um elogio ou sugestão <Icon name="arrow-right" size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

export { TrackedA };
