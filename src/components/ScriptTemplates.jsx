import React, { useState } from "react";
import { MessageSquareCode, Copy, Check, Sparkles, Filter, ChevronDown, ChevronUp, Phone, Mail, Instagram } from "lucide-react";

/**
 * GrowthHunter — Central de Scripts de Prospecção
 * Metodologia: Valor primeiro → Personalização → CTA único → Cadência D0-D14
 * Baseado no framework SDR Sênior + Sales Automator
 */

const SCRIPT_LIBRARY = [
  // ─── OFERTA: CRIAÇÃO DE SITE (Sem Presença Web) ───────────────────────────
  {
    id: "no-site-whatsapp",
    offer: "Criação de Site",
    channel: "WhatsApp",
    channelIcon: "💬",
    category: "🚨 Sem Site — Criação de Landing Page",
    title: "Abordagem Consultiva — Empresa Sem Site",
    target: "Empresas bem avaliadas no Google Maps que não possuem site próprio",
    when: "Empresa com 50+ avaliações e sem site cadastrado",
    cadence: [
      {
        day: "D0 — Primeiro Contato",
        text: `Oi {nome}! Tudo bem?

Vi que a {nome} tem {avaliacoes} avaliações no Google Maps — uma reputação excelente em {cidade}. 👏

Só que percebi que quando um cliente pesquisa por "{nicho} em {cidade}" no Google, vocês não aparecem nos resultados orgânicos nem nos anúncios.

Hoje vocês recebem pedidos de orçamento de clientes que encontraram a empresa no Google, ou vem tudo por indicação?`
      },
      {
        day: "D3 — Novo Ângulo",
        text: `Oi {nome}! Só pra contextualizar melhor o que mencionei:

Toda semana, dezenas de pessoas em {cidade} pesquisam por {nicho} no Google — e 90% delas clicam apenas nos 3 primeiros resultados.

Sem um site, a {nome} fica invisível pra esses clientes que já estão prontos para contratar.

Faz sentido olharmos isso juntos? Posso te mostrar quantas buscas acontecem por mês na sua cidade.`
      },
      {
        day: "D7 — Prova Social",
        text: `Oi {nome}! Semana passada finalizamos a Landing Page de uma {nicho} aqui em {cidade}.

Em 18 dias no ar, ela já gerou 23 mensagens de orçamento direto no WhatsApp — zero investimento em anúncio ainda.

Teria 10 minutos essa semana pra eu te mostrar o projeto?`
      },
      {
        day: "D11 — Pergunta Direta",
        text: `Oi {nome}! Posso te fazer uma pergunta direta?

Criar um site pra {nome} é algo que está no planejamento de vocês nos próximos meses — ou não é uma prioridade agora?

Quero entender se faz sentido seguirmos a conversa. 🙂`
      },
      {
        day: "D14 — Breakup",
        text: `Oi {nome}! Vou encerrar minhas mensagens por aqui pra não tomar o seu tempo.

Se a criação de um site para a {nome} entrar na pauta algum momento, é só me chamar — estarei disponível.

Um abraço e sucesso nos negócios! 🤝`
      }
    ]
  },
  {
    id: "no-site-email",
    offer: "Criação de Site",
    channel: "E-mail",
    channelIcon: "📧",
    category: "🚨 Sem Site — Criação de Landing Page",
    title: "E-mail Frio — Empresa Sem Presença Web",
    target: "Empresa com boa reputação local mas sem site",
    when: "Use quando tiver o e-mail de contato da empresa",
    cadence: [
      {
        day: "D0 — E-mail Inicial",
        text: `Assunto: {nome} aparece no Google quando o cliente procura?

Olá time da {nome},

Pesquisei por "{nicho} em {cidade}" no Google hoje para mapear as empresas mais bem avaliadas da região.

A {nome} aparece com {avaliacoes} avaliações excelentes no Maps — o que mostra que vocês entregam um serviço de qualidade.

O que percebi, porém, é que quando um potencial cliente clica nos resultados de busca do Google, a {nome} não possui uma página própria para recebê-lo.

Na prática: clientes de alto valor que pesquisam ativamente por {nicho} estão sendo capturados pela concorrência.

Trabalhamos com criação de Landing Pages de alta conversão, focadas em gerar orçamentos direto no WhatsApp — sem depender de anúncios no começo.

Essa frente de captação digital é algo que vocês têm olhado?

Atenciosamente,
[Seu Nome]
[Sua Agência]`
      },
      {
        day: "D5 — Follow-up",
        text: `Assunto: Re: {nome} aparece no Google quando o cliente procura?

Olá {nome}!

Só revisitando minha mensagem anterior — sei que a caixa de entrada fica cheia.

Preparei um levantamento rápido: por mês, cerca de [X] pessoas pesquisam por {nicho} em {cidade} no Google. Sem um site ativo, a {nome} fica fora desse radar.

Vale 10 minutos de conversa para eu te mostrar os números reais da sua região?

Abraço,
[Seu Nome]`
      }
    ]
  },
  {
    id: "no-site-cold-call",
    offer: "Criação de Site",
    channel: "Ligação",
    channelIcon: "📞",
    category: "🚨 Sem Site — Criação de Landing Page",
    title: "Cold Call — Falar com o Proprietário",
    target: "Falar com o dono ou gerente da empresa",
    when: "Use após tentativa de WhatsApp sem retorno (D3+)",
    cadence: [
      {
        day: "Script de Ligação",
        text: `[Para atendente/recepcionista]
— Bom dia! Por gentileza, poderia me conectar com o responsável pela área comercial ou com o proprietário da {nome}?

─────────────────────────────

[Quando o dono atender]
— Oi {nome}, tudo bem? Me chamo [Seu Nome], sou especialista em presença digital para empresas de {nicho}.

Liguei porque mapeei as empresas melhor avaliadas de {cidade} e vi que a {nome} tem uma reputação excelente — {avaliacoes} avaliações no Google.

O que percebi é que quando um cliente pesquisa por {nicho} na cidade, a {nome} não aparece nos resultados. Você teria 5 minutinhos agora para eu te mostrar quantas buscas acontecem por mês na sua região?

─────────────────────────────

[Se disser que não tem tempo agora]
— Sem problema! Qual seria o melhor momento — amanhã de manhã ou à tarde?`
      }
    ]
  },

  // ─── OFERTA: REFORMULAÇÃO DE SITE (Site com Nota Baixa) ──────────────────
  {
    id: "bad-site-whatsapp",
    offer: "Reformulação de Site",
    channel: "WhatsApp",
    channelIcon: "💬",
    category: "⚠️ Site Ruim — Reformulação & Conversão",
    title: "Abordagem Consultiva — Site com Problemas de Performance",
    target: "Empresas cujo site tem nota < 50 no PageSpeed ou design desatualizado",
    when: "Site existe mas tem carregamento lento, não é responsivo ou converte mal",
    cadence: [
      {
        day: "D0 — Primeiro Contato",
        text: `Oi {nome}! Tudo bem?

Dei uma olhada no site da {nome} ({site}) — vocês têm um bom negócio em {cidade}.

Notei, porém, que ele carrega lentamente no celular e não possui um botão de WhatsApp em destaque. Na prática, isso faz o visitante ir embora antes de entrar em contato.

Isso é algo que vocês já identificaram ou não é uma preocupação por aí?`
      },
      {
        day: "D3 — Diagnóstico com Dado",
        text: `Oi {nome}! Complementando o que mandei:

Rodei um diagnóstico rápido no site de vocês e o tempo de carregamento no celular está em [X] segundos.

Estudos do Google mostram que 53% dos visitantes abandonam um site que demora mais de 3 segundos para carregar.

Faz sentido conversarmos sobre como uma reformulação pode aumentar o contato de clientes via WhatsApp?`
      },
      {
        day: "D7 — Prova Social",
        text: `Oi {nome}! Reformulamos recentemente o site de uma {nicho} aqui em {cidade}.

O resultado: a taxa de cliques no WhatsApp aumentou 3x em 30 dias — sem aumento no investimento em anúncios.

Posso te apresentar o antes e depois em 10 minutos essa semana?`
      },
      {
        day: "D11 — Pergunta de Qualificação",
        text: `Oi {nome}! Uma pergunta direta:

O site da {nome} hoje gera contatos de clientes de forma consistente ou a maioria vem por indicação?

Pergunto porque a resposta define exatamente qual solução faz mais sentido pra vocês.`
      },
      {
        day: "D14 — Breakup",
        text: `Oi {nome}! Encerro minhas mensagens por aqui pra não incomodar.

Se a performance do site da {nome} entrar em pauta no futuro — seja para carregamento mobile, conversão ou anúncios — é só me chamar.

Sucesso e um abraço! 🤝`
      }
    ]
  },
  {
    id: "bad-site-instagram",
    offer: "Reformulação de Site",
    channel: "Instagram DM",
    channelIcon: "📱",
    category: "⚠️ Site Ruim — Reformulação & Conversão",
    title: "Instagram DM — Abordagem pelo Perfil da Empresa",
    target: "Empresas com perfil ativo no Instagram mas site desatualizado",
    when: "Empresa tem bom engajamento no Instagram mas o site abandona o visitante",
    cadence: [
      {
        day: "D0 — DM Inicial",
        text: `Oi {nome}! Acompanho o perfil de vocês aqui no Instagram — o conteúdo está bem alinhado com o público de {cidade}. 👏

Fui verificar o site ({site}) pra entender melhor a jornada do cliente e notei que ele não está carregando bem no celular — o que pode estar cortando o caminho entre o visitante e o WhatsApp de vocês.

Vocês já tinham percebido isso ou ainda não tinha chegado no radar?`
      },
      {
        day: "D5 — Follow-up DM",
        text: `Oi {nome}! Só voltando aqui.

A maioria dos visitantes do site de vocês provavelmente chega pelo celular — e um site lento no mobile perde 50%+ das visitas antes de converter.

Posso te mandar um diagnóstico gratuito de 2 minutos mostrando exatamente o que está impactando a conversão da {nome}?`
      }
    ]
  },

  // ─── OFERTA: TRÁFEGO PAGO (Site Bom, Sem Anúncios) ──────────────────────
  {
    id: "good-site-traffic-whatsapp",
    offer: "Tráfego Pago",
    channel: "WhatsApp",
    channelIcon: "💬",
    category: "✅ Site Bom — Tráfego Pago (Google/Meta Ads)",
    title: "Abordagem Consultiva — Empresa Pronta para Escalar",
    target: "Empresas com site profissional mas sem campanhas de tráfego ativas",
    when: "Site tem boa nota (70+) mas não aparece em anúncios patrocinados",
    cadence: [
      {
        day: "D0 — Primeiro Contato",
        text: `Oi {nome}! Tudo bem?

Vi que a {nome} tem um site bem estruturado em {cidade} — parabéns, isso é raro no segmento de {nicho}.

Percebi porém que quando um cliente pesquisa por "{nicho} em {cidade}" no Google, os anúncios patrocinados mostram apenas a concorrência.

Vocês estão veiculando campanhas de tráfego pago no momento ou ainda não chegaram nessa frente?`
      },
      {
        day: "D3 — Ângulo da Perda",
        text: `Oi {nome}! Contextualizando melhor:

Toda semana, dezenas de pessoas em {cidade} pesquisam ativamente por {nicho} no Google — são clientes com intenção de compra imediata.

Quem aparece nos anúncios patrocinados captura esse fluxo. Quem não aparece… deixa o cliente na mão da concorrência.

A {nome} tem toda a estrutura para converter esses clientes. Faz sentido conversarmos sobre isso?`
      },
      {
        day: "D7 — Prova de ROI",
        text: `Oi {nome}! Gerenciamos campanhas de Google Ads para uma {nicho} em {cidade} com investimento de R$ 1.200/mês.

Em 45 dias: 67 novos orçamentos recebidos no WhatsApp. Custo por lead: R$ 17,90.

Teria 15 minutos essa semana para eu te apresentar como replicar isso para a {nome}?`
      },
      {
        day: "D11 — Pergunta de Qualificação",
        text: `Oi {nome}! Uma pergunta objetiva:

Hoje a {nome} tem uma meta mensal de novos clientes que não está sendo atingida por falta de volume de orçamentos — ou a demanda atual está bem coberta?

A resposta vai definir se faz sentido conversarmos agora ou não.`
      },
      {
        day: "D14 — Breakup",
        text: `Oi {nome}! Encerro por aqui pra respeitar o seu tempo.

Se a {nome} decidir escalar a captação via Google Ads ou Meta Ads no futuro, estou disponível.

Um abraço e muito sucesso! 🤝`
      }
    ]
  },
  {
    id: "good-site-traffic-email",
    offer: "Tráfego Pago",
    channel: "E-mail",
    channelIcon: "📧",
    category: "✅ Site Bom — Tráfego Pago (Google/Meta Ads)",
    title: "E-mail Frio — Escalar Captação com Google Ads",
    target: "Empresa com site profissional, sem anúncios ativos",
    when: "Use quando o site da empresa for bom e você tiver o e-mail de contato",
    cadence: [
      {
        day: "D0 — E-mail Inicial",
        text: `Assunto: A concorrência está capturando os clientes que pesquisam "{nicho} em {cidade}"

Olá time da {nome},

Mapeei as empresas mais bem estruturadas do segmento de {nicho} em {cidade} e a {nome} se destacou — site limpo, boa reputação no Google Maps.

O que me chamou atenção, porém, foi que ao pesquisar por "{nicho} em {cidade}", os anúncios patrocinados estão sendo ocupados pelos concorrentes.

Clientes com intenção de compra imediata estão passando pela {nome}... e convertendo na concorrência.

Gerenciamos campanhas de tráfego pago (Google Ads + Meta Ads) com foco em gerar orçamentos diretos no WhatsApp da equipe comercial. O investimento mínimo é de R$ 800/mês em mídia, com gestão sob medida.

Essa frente de captação é algo que vocês têm planejado?

Atenciosamente,
[Seu Nome]
[Sua Agência]`
      },
      {
        day: "D6 — Follow-up com Dado",
        text: `Assunto: Re: A concorrência está capturando os clientes de {cidade}

Olá {nome}!

Voltando com um dado concreto: geramos 67 orçamentos em 45 dias para uma empresa de {nicho} em cidade similar, com investimento de R$ 1.200/mês.

Custo por lead qualificado: R$ 17,90.

Vale 15 minutos de conversa para analisar o potencial da {nome} nessa mesma estrutura?

Abraço,
[Seu Nome]`
      }
    ]
  },

  // ─── OBJEÇÕES UNIVERSAIS ─────────────────────────────────────────────────
  {
    id: "objections",
    offer: "Universal",
    channel: "Objeções",
    channelIcon: "🛡️",
    category: "🛡️ Tratamento de Objeções",
    title: "Respostas Investigativas para as 6 Objeções Mais Comuns",
    target: "Qualquer prospect em qualquer estágio da cadência",
    when: "Use quando o prospect bloquear com uma objeção padrão",
    cadence: [
      {
        day: "\"Já tenho agência\"",
        text: `Boa! E com a agência de vocês, a meta mensal de novos orçamentos está sendo atingida de forma consistente — ou existe uma meta que vocês ainda não conseguiram bater?`
      },
      {
        day: "\"Não tenho interesse agora\"",
        text: `Tranquilo, respeito totalmente. Só pra eu não insistir no assunto errado: hoje a captação de novos clientes para a {nome} está fluindo bem, ou existe uma meta de crescimento que vocês gostariam de acelerar nos próximos meses?`
      },
      {
        day: "\"Quanto custa?\"",
        text: `Boa pergunta! O investimento varia com base no objetivo de vocês. Pra te passar um número preciso: o foco principal agora é aumentar o volume de orçamentos recebidos no WhatsApp ou melhorar a qualidade dos leads que chegam?`
      },
      {
        day: "\"Não tenho dinheiro\"",
        text: `Entendo. Fico curioso: a limitação é de orçamento para marketing agora, ou a operação ainda não comporta crescimento de demanda? Pergunto porque dependendo do caso, a solução pode ser bem diferente.`
      },
      {
        day: "\"Me manda mais informações\"",
        text: `Claro! Pra eu enviar o que é mais relevante para vocês: o maior desafio hoje é trazer novos clientes, converter os que já chegam ou escalar o que já funciona?`
      },
      {
        day: "\"Vou pensar\"",
        text: `Sem problema! Só pra eu entender melhor: tem alguma informação específica que falta para essa decisão ficar mais clara — ou é mais uma questão de timing por aí?`
      }
    ]
  }
];

const OFFER_FILTERS = ["Todos", "Criação de Site", "Reformulação de Site", "Tráfego Pago", "Universal"];
const CHANNEL_FILTERS = ["Todos os Canais", "WhatsApp", "E-mail", "Ligação", "Instagram DM", "Objeções"];

export default function ScriptTemplates() {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState("Todos");
  const [selectedChannel, setSelectedChannel] = useState("Todos os Canais");
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState({});

  const filtered = SCRIPT_LIBRARY.filter(s => {
    const offerOk = selectedOffer === "Todos" || s.offer === selectedOffer;
    const channelOk = selectedChannel === "Todos os Canais" || s.channel === selectedChannel;
    return offerOk && channelOk;
  });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCard = (id) => setExpandedCard(prev => prev === id ? null : id);

  const getDayIndex = (scriptId) => activeDayIndex[scriptId] ?? 0;
  const setDayIndex = (scriptId, idx) => setActiveDayIndex(prev => ({ ...prev, [scriptId]: idx }));

  const offerColors = {
    "Criação de Site": { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", badge: "#ef4444" },
    "Reformulação de Site": { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", badge: "#f59e0b" },
    "Tráfego Pago": { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", badge: "#22c55e" },
    "Universal": { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.35)", badge: "#8b5cf6" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Header ── */}
      <div className="glass-card" style={{
        padding: "1.5rem 2rem",
        background: "linear-gradient(135deg, rgba(255,98,0,0.10) 0%, rgba(15,23,42,0.85) 100%)",
        border: "1px solid rgba(255,98,0,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
              <MessageSquareCode size={22} color="var(--accent)" />
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800" }}>Central de Scripts de Prospecção</h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Cadências D0→D14 validadas · Valor primeiro · Um CTA por mensagem · Objeções investigativas
            </p>
          </div>

          {/* Estatísticas */}
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[
              { label: "Scripts", val: SCRIPT_LIBRARY.length },
              { label: "Touchpoints", val: SCRIPT_LIBRARY.reduce((acc, s) => acc + s.cadence.length, 0) },
              { label: "Ofertas", val: 3 },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent)" }}>{stat.val}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.25rem" }}>
          {/* Oferta */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {OFFER_FILTERS.map(f => (
              <button key={f} onClick={() => setSelectedOffer(f)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: selectedOffer === f ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                  background: selectedOffer === f ? "rgba(255,98,0,0.15)" : "transparent",
                  color: selectedOffer === f ? "var(--accent)" : "var(--text-muted)",
                  transition: "all 0.15s"
                }}>
                {f}
              </button>
            ))}
          </div>
          {/* Canal */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {CHANNEL_FILTERS.map(c => (
              <button key={c} onClick={() => setSelectedChannel(c)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: selectedChannel === c ? "1px solid #60a5fa" : "1px solid var(--border-color)",
                  background: selectedChannel === c ? "rgba(96,165,250,0.12)" : "transparent",
                  color: selectedChannel === c ? "#60a5fa" : "var(--text-muted)",
                  transition: "all 0.15s"
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Script Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            Nenhum script encontrado para os filtros selecionados.
          </div>
        )}

        {filtered.map((script) => {
          const colors = offerColors[script.offer] || offerColors["Universal"];
          const isExpanded = expandedCard === script.id;
          const dayIdx = getDayIndex(script.id);
          const activeStep = script.cadence[dayIdx];
          const copyKey = `${script.id}-${dayIdx}`;

          return (
            <div key={script.id} className="glass-card" style={{
              border: `1px solid ${colors.border}`,
              background: colors.bg,
              overflow: "hidden",
              transition: "all 0.2s"
            }}>
              {/* Card Header */}
              <div
                style={{ padding: "1.25rem 1.5rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
                onClick={() => toggleCard(script.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1rem" }}>{script.channelIcon}</span>
                    <span style={{
                      fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase",
                      letterSpacing: "0.06em", color: colors.badge,
                      background: `${colors.badge}22`, padding: "0.15rem 0.5rem", borderRadius: "4px"
                    }}>
                      {script.offer}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
                      {script.channel}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem" }}>{script.title}</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    💡 {script.target}
                  </p>
                  <p style={{ fontSize: "0.73rem", color: "#fbbf24", marginTop: "0.2rem" }}>
                    ⏰ {script.when}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "1rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{script.cadence.length} touchpoints</span>
                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ padding: "0 1.5rem 1.5rem", borderTop: `1px solid ${colors.border}` }}>

                  {/* Day Tabs */}
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1rem", marginBottom: "1rem" }}>
                    {script.cadence.map((step, idx) => (
                      <button key={idx} onClick={() => setDayIndex(script.id, idx)}
                        style={{
                          padding: "0.3rem 0.7rem",
                          borderRadius: "6px",
                          fontSize: "0.74rem",
                          fontWeight: dayIdx === idx ? "700" : "500",
                          cursor: "pointer",
                          border: dayIdx === idx ? `1px solid ${colors.badge}` : "1px solid var(--border-color)",
                          background: dayIdx === idx ? `${colors.badge}22` : "transparent",
                          color: dayIdx === idx ? colors.badge : "var(--text-muted)",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap"
                        }}>
                        {step.day.split(" — ")[0]}
                      </button>
                    ))}
                  </div>

                  {/* Step Label */}
                  <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.6rem" }}>
                    📋 {activeStep.day}
                  </div>

                  {/* Script Text */}
                  <div style={{
                    background: "#0f172a",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem 1.25rem",
                    fontSize: "0.85rem",
                    color: "#cbd5e1",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.65",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {activeStep.text}
                  </div>

                  {/* Copy Button */}
                  <button
                    className={copiedId === copyKey ? "btn-primary" : "btn-secondary"}
                    onClick={() => handleCopy(copyKey, activeStep.text)}
                    style={{ justifyContent: "center", width: "100%", marginTop: "0.75rem" }}
                  >
                    {copiedId === copyKey ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedId === copyKey ? "Copiado!" : "Copiar Mensagem"}</span>
                  </button>

                  {/* Navigation arrows */}
                  {script.cadence.length > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                      <button
                        className="btn-ghost"
                        onClick={() => setDayIndex(script.id, Math.max(0, dayIdx - 1))}
                        disabled={dayIdx === 0}
                        style={{ fontSize: "0.8rem", opacity: dayIdx === 0 ? 0.3 : 1 }}
                      >
                        ← Anterior
                      </button>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center" }}>
                        {dayIdx + 1} / {script.cadence.length}
                      </span>
                      <button
                        className="btn-ghost"
                        onClick={() => setDayIndex(script.id, Math.min(script.cadence.length - 1, dayIdx + 1))}
                        disabled={dayIdx === script.cadence.length - 1}
                        style={{ fontSize: "0.8rem", opacity: dayIdx === script.cadence.length - 1 ? 0.3 : 1 }}
                      >
                        Próximo →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
