import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Artwork } from '@/components/ui/Artwork';
import { Icon } from '@/components/ui/Icon';
import { PageHero, PendingBadge } from '@/components/ui/primitives';
import { TrackedButton, TrackView } from '@/components/ui/Tracked';
import { getService, services } from '@/lib/data/services';
import { site } from '@/lib/data/site';
import { whatsappLink } from '@/lib/integrations/whatsapp';

type Props = { params: Promise<{ slug: string }> };

const art: Record<string, string> = { 'centro-cirurgico': 'cirurgia', internacao: 'equipe', maternidade: 'maternidade', 'plantao-pediatrico': 'pediatria', hotelaria: 'recepcao', diagnostico: 'tomografia', 'pronto-atendimento': 'hospital' };

export async function generateStaticParams() {
  return services.filter((s) => !['pronto-atendimento', 'diagnostico'].includes(s.slug)).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getService((await params).slug);
  if (!s) return {};
  return { title: s.name, description: s.description, alternates: { canonical: `/servicos/${s.slug}` } };
}

export default async function ServicePage({ params }: Props) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const pediatric = s.slug === 'plantao-pediatrico';
  return (
    <>
      <TrackView event="view_service" params={{ service_slug: s.slug }} />
      <PageHero crumbs={[{ label: 'Atendimento', href: '/pronto-atendimento' }, { label: s.name }]} eyebrow="Nossos serviços" title={s.name} intro={s.description} art={<Artwork name={art[s.slug] ?? 'institucional'} ratio="4 / 3" />}>
        {pediatric ? (
          <TrackedButton href={`tel:${site.contacts.pediatricOnCall.tel}`} event="click_emergency" params={{ origin: 'pediatric', action: 'call' }} icon="phone" size="lg">Ligar {site.contacts.pediatricOnCall.label}</TrackedButton>
        ) : (
          <TrackedButton href={`/agendar?origem=servico-${s.slug}`} event="click_schedule" params={{ origin: `service-${s.slug}` }} icon="calendar" size="lg">Agendar avaliação</TrackedButton>
        )}
        <TrackedButton href={whatsappLink({ intent: s.name, origin: `servico-${s.slug}` })} event="click_whatsapp" params={{ origin: `service-${s.slug}` }} variant="secondary" icon="whatsapp" size="lg">Falar com atendimento</TrackedButton>
      </PageHero>
      <section className="section">
        <div className="container with-aside">
          <div className="prose">
            <h2>Destaques</h2>
            <ul className="icon-list">{s.highlights.map((h) => <li key={h}><Icon name="check" size={20} /><span>{h}</span></li>)}</ul>
            {s.slug === 'internacao' && (
              <>
                <h2>Antes da internação</h2>
                <p>Separe documento com foto, cartão do convênio, exames e receitas recentes e a lista de remédios em uso. Traga itens de higiene e roupas confortáveis.</p>
                <h2>Acompanhantes e visitas</h2>
                <p>Crianças, adolescentes, idosos, gestantes e pessoas com deficiência têm direito a acompanhante. Horários de visita e regras de troca serão publicados após validação. <PendingBadge /></p>
                <p><Link href="/pacientes-e-acompanhantes">Ver o guia completo para pacientes e acompanhantes</Link></p>
              </>
            )}
            {s.slug === 'centro-cirurgico' && (
              <>
                <h2>Como funciona uma cirurgia agendada</h2>
                <ol>
                  <li>Consulta com o cirurgião e pedido de exames pré-operatórios.</li>
                  <li>Avaliação pré-anestésica.</li>
                  <li>Orientações de jejum e internação, por escrito.</li>
                  <li>Cirurgia, recuperação e alta com orientações de retorno.</li>
                </ol>
              </>
            )}
            {s.slug === 'maternidade' && (
              <>
                <h2>Do pré-natal ao pós-parto</h2>
                <p>Converse com a equipe sobre o seu plano de parto, acompanhante, alívio da dor e contato pele a pele com o bebê. <Link href="/conteudo/parto-humanizado">Leia sobre parto humanizado</Link>.</p>
                <p>Visita à maternidade, enxoval e documentos para internação: informações a validar com o hospital. <PendingBadge /></p>
              </>
            )}
            {pediatric && (
              <>
                <h2>Quando procurar o plantão</h2>
                <p>Febre em bebês com menos de 3 meses, dificuldade para respirar, sonolência excessiva, manchas roxas na pele, convulsão ou recusa total de líquidos. <Link href="/conteudo/plantao-pediatrico">Saiba mais</Link>.</p>
              </>
            )}
            <p className="disclaimer">Informações institucionais baseadas no site atual do hospital ({s.source}). Atualizado em {new Date(s.updatedAt + 'T12:00:00').toLocaleDateString('pt-BR')}.</p>
          </div>
          <aside>
            <div className="card is-blue">
              <h2>Fale com a gente</h2>
              <ul className="icon-list">
                <li><Icon name="whatsapp" size={20} /><span>{site.contacts.scheduling.label}</span></li>
                {pediatric && <li><Icon name="child" size={20} /><span>Plantão pediátrico: {site.contacts.pediatricOnCall.label}</span></li>}
                <li><Icon name="pin" size={20} /><span>{site.address.street}, Cacoal</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
