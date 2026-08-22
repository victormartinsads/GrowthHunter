import React, { useState } from "react";
import { MessageSquareCode, Copy, Check, Sparkles, Filter, ChevronDown, ChevronUp, Mic, Video, MessageCircle, Phone, Mail, ShieldAlert } from "lucide-react";

/**
 * GrowthHunter — Central de Scripts de Vendas 100% Humanos
 * Metodologia: Prospectagram + Gabriel Miranda
 * - Zero robô / zero jargão corporativo de agência
 * - Quebra de padrão, gancho visual, scripts de áudio 30s, micro-CTAs e follow-ups leves
 */

const SCRIPT_LIBRARY = [
  // ─── MÉTODO GABRIEL MIRANDA: GANCHO VISUAL & MODELO PRONTO ────────────────
  {
    id: "gm-modelo-site",
    offer: "Criação de Site",
    channel: "WhatsApp",
    channelIcon: "📱",
    category: "🔥 Método Gabriel Miranda (Gancho Visual / Modelo Pronto)",
    title: "Script do Modelo Rascunhado (Alta Taxa de Resposta)",
    target: "Empresas com boa nota no Google Maps mas sem site",
    when: "Ideal para enviar de manhã ou início da tarde no WhatsApp comercial",
    cadence: [
      {
        day: "D0 — Abordagem com Rascunho / Vídeo de 30s",
        text: `Opa, tudo bem? Vi a {nome} aqui no Google Maps em {cidade}, muito boas as avaliações de vocês! 👏

Estava pesquisando empresas de {nicho} na região e vi que vocês ainda não têm um site próprio no Google.

Como o pessoal aqui pesquisa bastante pelo celular, eu montei uma prévia rápida de como ficaria uma página bem limpa pra vocês receberem orçamentos direto no WhatsApp.

Quer que eu te mande um print/vídeo de 30 segundos pra dar uma olhada sem compromisso?`
      },
      {
        day: "D2 — Follow-up Curto",
        text: `Opa! Conseguiu ver a mensagem que te mandei acima? 🙂`
      },
      {
        day: "D4 — Script de Áudio no WhatsApp (30 segundos)",
        text: `🎙️ [ENVIAR ÁUDIO NATURAL DE 25 A 35 SEGUNDOS]:
"Fala {nome}, tudo joia? Te mandei mensagem esses dias... gravei esse áudio rapidinho só pra te explicar: vi que vocês têm bastante cliente elogiando vocês no Google aqui em {cidade}, mas quem pesquisa pelo serviço no celular não acha a página de vocês. Rascunhei um modelo bem direto ao ponto pro cliente clicar e já cair no Whats da recepção. Se quiser dar uma olhada, me dá um alô aqui que te mando sem custo nenhum, só pra você ver se gosta. Valeu!"`
      },
      {
        day: "D7 — Pergunta Leve de Fechamento",
        text: `Oi! Só pra eu não insistir no assunto errado: colocar um site no ar pra receber clientes do Google é algo que tá no radar de vocês esse mês ou a agenda já tá lotada por aí?`
      },
      {
        day: "D11 — Breakup Amigável",
        text: `Imagino que a correria esteja grande por aí! Não vou mais te incomodar haha. Se um dia quiserem colocar um site no ar ou pegar clientes do Google, é só me dar um alô aqui. Sucesso pra {nome}! 🤝`
      }
    ]
  },

  // ─── MÉTODO PROSPECTAGRAM: PERGUNTA CURIOSA / DÚVIDA GENUÍNA ─────────────
  {
    id: "prospectagram-duvida",
    offer: "Criação de Site",
    channel: "WhatsApp",
    channelIcon: "💬",
    category: "🎯 Método Prospectagram (Dúvida Genuína / 78% de Resposta)",
    title: "Abordagem por Dúvida Genuína (Quebra de Padrão)",
    target: "Empresas sem site — tom de cliente/pesquisador local",
    when: "Funciona muito bem quando a recepção ou o dono atendem diretamente",
    cadence: [
      {
        day: "D0 — 1ª Mensagem Curta (1 a 2 linhas)",
        text: `Opa, tudo bem? Vi vocês aqui no Google Maps em {cidade}, excelente a nota de vocês! 👏

Fui procurar o site ou cardápio/tabela de serviços de vocês pra ver aqui e vi que não tem página cadastrada.

Hoje vocês atendem só por indicação ou pegam clientes que pesquisam no Google também?`
      },
      {
        day: "D2 — Continuação Natural",
        text: `Opa, tudo joia? Só voltando aqui porque toda semana dezenas de pessoas pesquisam por {nicho} em {cidade} no Google, e quem não tem site acaba perdendo esses contatos pra concorrência.

Hoje vocês já têm alguém cuidando dessa parte de site/Google ou tá parado por aí?`
      },
      {
        day: "D5 — Prova com Exemplo Real",
        text: `Oi {nome}! Semana passada colocamos no ar a página de uma {nicho} aqui perto.

Nas primeiras 2 semanas, já foram 18 pessoas que chamaram no WhatsApp vindas direto do Google, sem pagar anúncio.

Quer que eu te mostre o modelo pra ver se faz sentido pra vocês?`
      },
      {
        day: "D9 — Breakup Natural",
        text: `Tranquilo! Imagino que estejam com a rotina corrida. Se em algum momento fizer sentido estruturar a presença da {nome} no Google, é só me chamar. Abraço!`
      }
    ]
  },

  // ─── OFERTA: SITE LENTO / COM PROBLEMA NO CELULAR ─────────────────────────
  {
    id: "site-lento-aviso",
    offer: "Reformulação de Site",
    channel: "WhatsApp",
    channelIcon: "⚠️",
    category: "⚠️ Site Ruim / Lento no Celular (Alerta Amigo)",
    title: "Aviso Sincero de Falha no Site (Sem Parecer Vendedor)",
    target: "Empresas com site lento ou sem botão de WhatsApp direto",
    when: "Use quando o PageSpeed for baixo ou faltar botão de WhatsApp",
    cadence: [
      {
        day: "D0 — Aviso Sincero e Desinteressado",
        text: `Fala pessoal da {nome}, tudo joia?

Dei uma olhada no site de vocês ({site}) pelo celular agora há pouco. A empresa de vocês parece ser muito boa em {cidade}, mas reparei que o botão de chamar no WhatsApp demorou bastante pra abrir aqui na tela.

Vocês já tinham percebido isso ou ninguém tinha avisado vocês ainda?`
      },
      {
        day: "D3 — Solução Rápida de 1 Minuto",
        text: `Opa! Só pra explicar melhor: a maioria dos clientes acessa pelo celular, e quando o site demora mais de 3 segundos, muita gente desiste e vai pro concorrente.

Gravei um videozinho de 40 segundos mostrando o que tá travando e como deixar o botão do WhatsApp instantâneo. Posso te mandar o link?`
      },
      {
        day: "D6 — Script de Áudio (Áudio Rápido)",
        text: `🎙️ [ÁUDIO DE 25s]:
"Opa {nome}, tudo bem? Só passando pra te dizer que nós arrumamos isso em 2 dias com um layout novo super rápido pro celular. Se quiser dar uma olhada em como fica, me dá um alô que te mostro sem compromisso nenhum!"`
      },
      {
        day: "D10 — Despedida",
        text: `Opa, sem problemas se não for o momento agora! Só quis avisar pra ajudar mesmo. Se precisarem de uma mão com o site da {nome} no futuro, contem comigo. Sucesso!`
      }
    ]
  },

  // ─── OFERTA: TRÁFEGO PAGO / GOOGLE ADS (SITE BOM) ────────────────────────
  {
    id: "trafego-google-ads",
    offer: "Tráfego Pago",
    channel: "WhatsApp",
    channelIcon: "📈",
    category: "✅ Site Bom — Tráfego Pago no Google (Conversa Direta)",
    title: "Oportunidade de Anúncios no Topo do Google",
    target: "Empresas com site bonito que não aparecem nos links patrocinados",
    when: "Empresa já tem site profissional mas não anuncia no Google",
    cadence: [
      {
        day: "D0 — Elogio + Observação Factual",
        text: `Opa, tudo bem? Vi o site da {nome} aqui em {cidade}, achei super caprichado! 👏

Só reparei que quando um cliente pesquisa por "{nicho} em {cidade}" no Google, os anúncios do topo tão sendo todos da concorrência de vocês.

Vocês já chegaram a rodar anúncios no Google pra puxar clientes pro WhatsApp ou ainda não é o foco?`
      },
      {
        day: "D3 — Dado Prático de Custo por Lead",
        text: `Opa! Só pra contextualizar: estamos gerenciando uma campanha pra um segmento parecido com o de vocês e cada pessoa que clica e chama no WhatsApp tá saindo na faixa de R$ 15 a R$ 20.

Como vocês já têm um site bom, o resultado costuma ser bem rápido.

Quer que eu te mostre como funciona a estrutura em 10 minutinhos?`
      },
      {
        day: "D7 — Pergunta Leve",
        text: `Oi! Uma dúvida rápida: hoje vocês teriam capacidade de atender mais 15 a 30 novos orçamentos por mês no Whats, ou a operação de vocês já tá no limite?`
      },
      {
        day: "D12 — Despedida",
        text: `Opa, beleza! Se no futuro vocês decidirem acelerar a captação pelo Google Ads, é só me dar um toque aqui. Abraço!`
      }
    ]
  },

  // ─── LIGAÇÃO DIRETA (COLD CALL HUMANA) ───────────────────────────────────
  {
    id: "ligacao-humana",
    offer: "Ligação",
    channel: "Ligação",
    channelIcon: "📞",
    category: "📞 Ligação Direta (Cold Call Sem Roteiro Engessado)",
    title: "Roteiro de Conversa Fluida com o Proprietário",
    target: "Falar direto com quem toma decisão sem parecer telemarketing",
    when: "Quando você liga após 1 ou 2 tentativas no WhatsApp",
    cadence: [
      {
        day: "Passo a Passo da Ligação",
        text: `[1. COM A SECRETÁRIA / ATENDENTE]:
— Opa, bom dia! Tudo joia? Por favor, o [Nome do Dono] tá por aí ou consigo falar 1 minutinho com o responsável pela empresa?

─────────────────────────────

[2. QUANDO O DONO ATENDER (Tom descontraído, nada de voz de telemarketing)]:
— Fala {nome}, tudo bem? Me chamo [Seu Nome]. Cara, te liguei rapidinho porque vi a {nome} no Google Maps com {avaliacoes} avaliações aqui em {cidade} — muito bacana o trabalho de vocês!

Só que dei uma olhada e vi que quem pesquisa por {nicho} no celular acaba caindo nos concorrentes porque vocês ainda não têm um site cadastrado pra receber orçamento no WhatsApp.

Hoje vocês já têm alguém olhando essa parte digital ou tá meio parado por aí?

─────────────────────────────

[3. SE ELE MOSTRAR INTERESSE]:
— Show! Eu rascunhei um modelo bem enxuto de como ficaria a página de vocês. Posso te mandar no WhatsApp pra você dar uma olhada de 1 minuto sem compromisso nenhum? Qual é o seu número direto?`
      }
    ]
  },

  // ─── TRATAMENTO DE OBJEÇÕES REAIS (RESPOSTAS HUMANAS) ────────────────────
  {
    id: "objecoes-humanas",
    offer: "Universal",
    channel: "Objeções",
    channelIcon: "🛡️",
    category: "🛡️ Respostas Humanas para as Objeções Mais Comuns",
    title: "Como Responder Objeções sem Ser Chato ou Vendedor",
    target: "Qualquer prospect em qualquer momento da conversa",
    when: "Use quando o cliente responder com uma desculpa ou dúvida",
    cadence: [
      {
        day: "\"Já tenho agência / quem faça\"",
        text: `Ah que massa! E eles tão conseguindo colocar vocês no topo do Google pra quem pesquisa em {cidade}, ou tão mais cuidando das postagens no Instagram?`
      },
      {
        day: "\"Não tenho interesse agora\"",
        text: `Tranquilo, sem crise nenhuma! É porque vocês já tão com a agenda cheia por aí ou porque já tiveram alguma experiência ruim com isso antes?`
      },
      {
        day: "\"Quanto custa?\"",
        text: `Cara, depende do que você precisa, mas é bem em conta. Uma página rápida pra receber orçamentos no Whats fica na faixa de R$ 1.500 a R$ 2.500 parcela única, sem mensalidade presa. Quer que eu te mostre o modelo pra ver se faz sentido pro seu negócio?`
      },
      {
        day: "\"Me manda a proposta por aqui\"",
        text: `Mando sim! Só me diz uma coisa rápida pra eu te mandar o que faz mais sentido: hoje o maior foco de vocês seria aparecer no Google pra quem busca na cidade ou passar mais confiança pra quem já chega no Whats?`
      },
      {
        day: "\"Vou ver com meu sócio / vou pensar\"",
        text: `Show de bola! Quer que eu te mande o print do modelo pra você mostrar pra ele? Ajuda bastante a visualizar como fica.`
      }
    ]
  }
];

const OFFER_FILTERS = ["Todos", "Criação de Site", "Reformulação de Site", "Tráfego Pago", "Ligação", "Universal"];

export default function ScriptTemplates() {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState("Todos");
  const [expandedCard, setExpandedCard] = useState("gm-modelo-site");
  const [activeDayIndex, setActiveDayIndex] = useState({});

  const filtered = SCRIPT_LIBRARY.filter(s => {
    return selectedOffer === "Todos" || s.offer === selectedOffer;
  });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCard = (id) => setExpandedCard(prev => prev === id ? null : id);
  const getDayIndex = (scriptId) => activeDayIndex[scriptId] ?? 0;
  const setDayIndex = (scriptId, idx) => setActiveDayIndex(prev => ({ ...prev, [scriptId]: idx }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Header ── */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #ffffff 100%)",
        border: "1px solid #fed7aa",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
              <MessageSquareCode size={24} color="#ea580c" />
              <h2 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#1c1917" }}>
                Central de Scripts de Vendas 100% Humanos
              </h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#57534e", lineHeight: 1.5 }}>
              Baseado nas metodologias de <strong>Prospectagram</strong> (abordagem por dúvida/WhatsApp curto) e <strong>Gabriel Miranda</strong> (gancho do modelo rascunhado/vídeo de 30s).
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.25rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#ea580c" }}>{SCRIPT_LIBRARY.length}</div>
              <div style={{ fontSize: "0.7rem", color: "#78716c", textTransform: "uppercase", fontWeight: "700" }}>Modelos</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#16a34a" }}>78%+</div>
              <div style={{ fontSize: "0.7rem", color: "#78716c", textTransform: "uppercase", fontWeight: "700" }}>Taxa Resposta</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1.2rem" }}>
          {OFFER_FILTERS.map(f => (
            <button 
              key={f} 
              onClick={() => setSelectedOffer(f)}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                border: selectedOffer === f ? "1px solid #ea580c" : "1px solid #e8e6e0",
                background: selectedOffer === f ? "#ea580c" : "#ffffff",
                color: selectedOffer === f ? "#ffffff" : "#57534e",
                transition: "all 0.15s"
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Script Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.map((script) => {
          const isExpanded = expandedCard === script.id;
          const dayIdx = getDayIndex(script.id);
          const activeStep = script.cadence[dayIdx] || script.cadence[0];
          const copyKey = `${script.id}-${dayIdx}`;

          return (
            <div key={script.id} className="glass-card" style={{
              border: isExpanded ? "1px solid #fed7aa" : "1px solid #e8e6e0",
              background: "#ffffff",
              overflow: "hidden",
              transition: "all 0.15s ease"
            }}>
              {/* Card Header */}
              <div
                style={{ 
                  padding: "1.25rem 1.5rem", 
                  cursor: "pointer", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  background: isExpanded ? "#fffaf5" : "#ffffff"
                }}
                onClick={() => toggleCard(script.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1.1rem" }}>{script.channelIcon}</span>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase",
                      color: "#ea580c", background: "#fff7ed", padding: "0.15rem 0.55rem", borderRadius: "4px", border: "1px solid #ffedd5"
                    }}>
                      {script.offer}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#57534e", background: "#f5f5f4", padding: "0.15rem 0.55rem", borderRadius: "4px" }}>
                      {script.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "0.2rem" }}>
                    {script.title}
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "#78716c" }}>
                    🎯 {script.target}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#78716c", fontWeight: "600" }}>{script.cadence.length} etapas</span>
                  {isExpanded ? <ChevronUp size={18} color="#ea580c" /> : <ChevronDown size={18} color="#78716c" />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ padding: "0 1.5rem 1.5rem", borderTop: "1px solid #fed7aa", background: "#ffffff" }}>

                  {/* Day Tabs */}
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1rem", marginBottom: "0.85rem" }}>
                    {script.cadence.map((step, idx) => (
                      <button key={idx} onClick={() => setDayIndex(script.id, idx)}
                        style={{
                          padding: "0.35rem 0.75rem",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: dayIdx === idx ? "800" : "600",
                          cursor: "pointer",
                          border: dayIdx === idx ? "1px solid #ea580c" : "1px solid #e8e6e0",
                          background: dayIdx === idx ? "#ea580c" : "#faf9f6",
                          color: dayIdx === idx ? "#ffffff" : "#57534e",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap"
                        }}>
                        {step.day.split(" — ")[0].split(":")[0]}
                      </button>
                    ))}
                  </div>

                  {/* Step Label */}
                  <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "#ea580c", marginBottom: "0.5rem" }}>
                    📋 {activeStep.day}
                  </div>

                  {/* Script Text */}
                  <div style={{
                    background: "#faf9f6",
                    border: "1px solid #e8e6e0",
                    borderRadius: "8px",
                    padding: "1.1rem 1.25rem",
                    fontSize: "0.9rem",
                    color: "#1c1917",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.6",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {activeStep.text}
                  </div>

                  {/* Copy Button */}
                  <button
                    className={copiedId === copyKey ? "btn-primary" : "btn-secondary"}
                    onClick={() => handleCopy(copyKey, activeStep.text)}
                    style={{ 
                      justifyContent: "center", 
                      width: "100%", 
                      marginTop: "0.85rem",
                      background: copiedId === copyKey ? "#16a34a" : "#ffffff",
                      borderColor: copiedId === copyKey ? "#15803d" : "#e8e6e0",
                      color: copiedId === copyKey ? "#ffffff" : "#1c1917"
                    }}
                  >
                    {copiedId === copyKey ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedId === copyKey ? "Script Copiado para a Área de Transferência!" : "Copiar Modelo de Mensagem"}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
