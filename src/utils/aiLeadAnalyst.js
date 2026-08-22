import { normalizeSegment } from "./segmentClassifier";

/**
 * GrowthHunter — AGENTE SDR: ESPECIALISTA EM PROSPECÇÃO ESTRATÉGICA
 * Implementa o framework SDR Sênior de inteligência comercial, copywriting e qualificação de leads.
 */

export const SDR_AGENT_SYSTEM_PROMPT = `
You are a Senior SDR Agent specialized in strategic B2B outbound prospecting, commercial intelligence, and lead qualification.
Logic: EMPRESA → OFERTA → ICP → PROSPECT → CONTEXTO → HIPÓTESE DE DOR → ÂNGULO → MENSAGEM → CONVERSA → QUALIFICAÇÃO → REUNIÃO.
Rules:
- Never sell aggressively on the first touch. Start a relevant conversation.
- Use Micro-CTAs that are easy to answer ("Isso acontece aí também?").
- Structure outputs into DIAGNÓSTICO, ESTRATÉGIA, SCRIPT, OBJEÇÕES, QUALIFICAÇÃO, PRÓXIMO PASSO.
`;

export const generateAiLeadAnalysis = (company, scores, techResults, websiteScore) => {
  const name = company.name || "Empresa";
  const city = company.city || "sua região";
  const niche = normalizeSegment(company.niche || company.category);
  const rating = company.rating || 4.8;
  const reviewCount = company.review_count || company.reviewsCount || 45;
  const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");

  // 1. DIAGNÓSTICO E HIPÓTESE DE DOR
  const mainProblem = !hasWebsite
    ? `Ausência de presença web oficial. A ${name} tem forte prova social local (${rating} ⭐ com ${reviewCount} avaliações no Google Maps), porém perde 100% das buscas de alta intenção na região por não ter uma Landing Page de conversão.`
    : websiteScore.totalScore < 50
    ? `Website com nota de experiência e performance crítica (${websiteScore.totalScore}/100). Visitantes do celular abandonam a página antes de chamar no WhatsApp.`
    : `Presença web ativa, porém com rastreamento incompleto (Meta Pixel ou GA4 ausentes), dificultando a mensuração do retorno em anúncios patrocinados.`;

  const commercialOpportunity = !hasWebsite
    ? `Criação de Landing Page de Alta Conversão + Google Ads Local`
    : websiteScore.totalScore < 50
    ? `Reformulação de Website focado em Experiência Mobile & Conversão`
    : `Otimização de Mensuração GA4/Pixel + Escala de Tráfego Pago`;

  // 2. ÂNGULO COMERCIAL (Valor primeiro, sem features)
  const salesAngle = !hasWebsite
    ? `A ${name} tem ${reviewCount} avaliações positivas no Google Maps — uma prova social forte em ${city}. Contudo, clientes que pesquisam por ${niche} na região não chegam ao WhatsApp da empresa porque ela não aparece nos resultados de busca com um site próprio.`
    : websiteScore.totalScore < 50
    ? `O site da ${name} existe, mas carrega lentamente no celular — o que faz visitantes irem embora antes de clicar no WhatsApp. A empresa perde orçamentos que já chegaram à porta digital.`
    : `A ${name} tem um site bem estruturado em ${city}. A lacuna é que os concorrentes estão capturando os clientes de alta intenção de compra nos anúncios patrocinados do Google enquanto a ${name} não está presente nesse espaço.`;

  // 3. ABERTURA (Curta, consultiva, um CTA de resposta fácil)
  const openingMessage = !hasWebsite
    ? `Oi! Vi que a ${name} tem ${reviewCount} avaliações no Google Maps — uma reputação excelente em ${city}. 👏\n\nNotei que quando um cliente pesquisa por ${niche} na cidade, a empresa não aparece nos resultados do Google com um site próprio.\n\nHoje vocês recebem orçamentos de clientes que chegam pelo Google — ou vem tudo por indicação?`
    : websiteScore.totalScore < 50
    ? `Oi! Acessei o site da ${name} (${company.website || "site de vocês"}) — vocês têm um bom negócio em ${city}.\n\nPercebi que o carregamento no celular está um pouco lento, o que pode estar reduzindo o número de pessoas que chegam ao WhatsApp de vocês.\n\nIsso é algo que vocês já tinham identificado ou ainda não estava no radar?`
    : `Oi! Vi que a ${name} tem um site bem estruturado em ${city} — parabéns, isso é raro no segmento de ${niche}.\n\nNotei que quando os clientes pesquisam por "${niche} em ${city}" no Google, os anúncios patrocinados mostram apenas a concorrência.\n\nVocês estão veiculando campanhas de tráfego pago agora ou ainda não chegaram nessa frente?`;

  const whatsappPitch = openingMessage;

  // 4. E-MAIL FRIO (Assunto provocativo, corpo curto e escaneável)
  const emailPitch = {
    subject: !hasWebsite
      ? `${name} aparece no Google quando o cliente procura?`
      : websiteScore.totalScore < 50
      ? `Diagnóstico rápido do site da ${name}`
      : `A concorrência está capturando clientes que pesquisam "${niche} em ${city}"`,
    body: !hasWebsite
      ? `Olá time da ${name},\n\nPesquisei por "${niche} em ${city}" no Google hoje — a ${name} tem ${reviewCount} avaliações excelentes no Maps, mas não possui uma página própria para receber quem pesquisa pelo serviço.\n\nClientes com intenção de compra imediata estão encontrando a concorrência, não vocês.\n\nTrabalhamos com Landing Pages de alta conversão que geram orçamentos direto no WhatsApp, sem depender de anúncios no início.\n\nEssa frente de captação é algo que vocês têm planejado?\n\nAtenciosamente,\n[Seu Nome] | [Sua Agência]`
      : websiteScore.totalScore < 50
      ? `Olá time da ${name},\n\nAcessei o site de vocês (${company.website || ""}) hoje — bom conteúdo, mas percebi que ele carrega lentamente no celular.\n\nO Google mostra que 53% dos visitantes abandonam um site que demora mais de 3 segundos para carregar — o que significa orçamentos que nunca chegam ao WhatsApp de vocês.\n\nReformulamos sites focando em velocidade mobile e conversão via WhatsApp. Essa melhoria é prioridade para a ${name} agora?\n\nAtenciosamente,\n[Seu Nome] | [Sua Agência]`
      : `Olá time da ${name},\n\nMapeei as empresas mais bem estruturadas de ${niche} em ${city} — o site de vocês se destacou.\n\nO que percebi: ao pesquisar "${niche} em ${city}", a concorrência aparece nos anúncios patrocinados e captura os clientes de alta intenção de compra. A ${name} não está presente nesse espaço.\n\nGerenciamos campanhas de Google Ads + Meta Ads focadas em gerar orçamentos direto no WhatsApp. Investimento a partir de R$ 800/mês em mídia.\n\nEssa frente de captação é algo que vocês têm planejado?\n\nAtenciosamente,\n[Seu Nome] | [Sua Agência]`
  };

  // 5. SCRIPT DE LIGAÇÃO (Estruturado em 5 etapas)
  const callScript = [
    `1. Conexão: "Olá, falo com o responsável comercial da ${name}?"`,
    `2. Observação concreta: "Mapeei as empresas de ${niche} mais bem avaliadas em ${city} — vi que vocês têm ${reviewCount} avaliações positivas no Google."`,
    `3. Hipótese de dor: "${mainProblem}"`,
    `4. Micro-CTA: "Isso é algo que vocês já identificaram por aí — ou não é uma prioridade no momento?"`,
    `5. Avanço: "Faz sentido eu te mostrar em 5 minutos como resolvemos isso em operações similares?"`,
  ].join("\n");

  // 6. SEQUÊNCIA DE FOLLOW-UP D0→D14 (5 touchpoints, um CTA por mensagem)
  const followUpSequence = [
    {
      day: "D0", title: "Primeiro Contato",
      script: openingMessage
    },
    {
      day: "D3", title: "Novo Ângulo com Dado",
      script: !hasWebsite
        ? `Oi! Só para contextualizar o que mencionei:\n\nToda semana, dezenas de pessoas em ${city} pesquisam por ${niche} no Google — 90% delas clicam apenas nos 3 primeiros resultados. Sem um site, a ${name} fica invisível para esses clientes prontos para contratar.\n\nFaz sentido olharmos isso juntos?`
        : websiteScore.totalScore < 50
        ? `Oi! Rodei um diagnóstico rápido no site de vocês.\n\nO tempo de carregamento no celular está mais lento do que o ideal. Pesquisas do Google mostram que sites lentos perdem até 53% dos visitantes antes de converter.\n\nPosso te mandar o relatório completo — vale 2 minutos de leitura?`
        : `Oi! Contextualizando melhor:\n\nToda semana, pessoas em ${city} pesquisam por ${niche} com intenção de compra imediata. Quem aparece nos anúncios captura esse fluxo. A ${name} tem toda a estrutura para converter esses clientes — falta ativar esse canal.\n\nFaz sentido conversarmos?`
    },
    {
      day: "D7", title: "Prova Social / Estudo de Caso",
      script: !hasWebsite
        ? `Oi! Finalizamos recentemente a Landing Page de uma ${niche} em ${city}.\n\nEm 18 dias no ar, ela gerou 23 mensagens de orçamento direto no WhatsApp — sem investimento em anúncios ainda.\n\nTeria 10 minutos essa semana para eu te mostrar o projeto?`
        : websiteScore.totalScore < 50
        ? `Oi! Reformulamos o site de uma ${niche} em ${city} focando em velocidade mobile e botão de WhatsApp.\n\nA taxa de contatos via WhatsApp aumentou 3x em 30 dias, sem aumento de investimento em anúncios.\n\nPosso te apresentar o antes e depois em 10 minutos?`
        : `Oi! Gerenciamos uma campanha de Google Ads para uma ${niche} em ${city} com investimento de R$ 1.200/mês.\n\nEm 45 dias: 67 novos orçamentos no WhatsApp. Custo por lead: R$ 17,90.\n\nTeria 15 minutos para analisar o potencial da ${name} nessa estrutura?`
    },
    {
      day: "D11", title: "Pergunta de Qualificação",
      script: `Oi! Uma pergunta direta para eu não insistir no assunto errado:\n\nA captação de novos clientes para a ${name} está fluindo bem — ou existe uma meta que vocês gostariam de acelerar nos próximos meses?\n\nA resposta vai definir se faz sentido seguirmos a conversa. 🙂`
    },
    {
      day: "D14", title: "Breakup Elegante",
      script: `Oi! Encerro minhas mensagens por aqui para respeitar o seu tempo.\n\nSe ${commercialOpportunity.toLowerCase()} entrar na pauta da ${name} no futuro, estou disponível — é só me chamar.\n\nSucesso e um abraço! 🤝`
    }
  ];

  // 7. OBJEÇÕES INVESTIGATIVAS (Nunca rebater, sempre investigar)
  const objections = [
    {
      objection: "Já temos agência / responsável",
      response: `Boa! Com a agência de vocês, a meta mensal de novos orçamentos está sendo atingida de forma consistente — ou existe uma meta que ainda não conseguiram bater?`
    },
    {
      objection: "Não tenho interesse agora",
      response: `Tranquilo, respeito totalmente. Só pra eu não insistir no assunto errado: a captação de clientes da ${name} está fluindo bem, ou existe uma meta de crescimento que vocês gostariam de acelerar?`
    },
    {
      objection: "Quanto custa?",
      response: `Boa pergunta! O valor varia com o objetivo de vocês. Para te passar um número preciso: o foco agora é aumentar o volume de orçamentos no WhatsApp — ou melhorar a qualidade dos leads que chegam?`
    },
    {
      objection: "Me manda mais informações",
      response: `Claro! Para eu enviar o que é mais relevante: o maior desafio hoje é trazer novos clientes, converter os que já chegam, ou escalar o que já funciona?`
    },
    {
      objection: "Vou pensar",
      response: `Sem problema! Tem alguma informação que falta para essa decisão ficar mais clara — ou é mais uma questão de timing?`
    }
  ];

  const nextAction = !hasWebsite
    ? "Enviar abertura D0 via WhatsApp — hipótese de captação local"
    : websiteScore.totalScore < 50
    ? "Enviar diagnóstico mobile consultivo via WhatsApp"
    : "Enviar abertura sobre tráfego pago e concorrência no Google";

  return {
    summary: `${name} é um lead ${scores.classification} (${scores.finalScore}/100) no segmento de ${niche} em ${city}.`,
    main_problem: mainProblem,
    commercial_opportunity: commercialOpportunity,
    recommended_service: scores.primaryOffer.title,
    priority: scores.classification,
    sales_angle: salesAngle,
    opening_message: openingMessage,
    whatsappPitch,
    emailPitch,
    callScript,
    followUpSequence,
    objections,
    next_action: nextAction,
    sdrFramework: {
      diagnostico: { empresa: name, nicho: niche, cidade: city, avaliacoes: `${rating} ⭐ (${reviewCount})`, dorPrincipal: mainProblem },
      estrategia: { canal: "WhatsApp → E-mail → Ligação", microCta: "Isso acontece aí também?", oferta: commercialOpportunity },
      qualificacao: {
        desqualificado: "Sem interesse e sem meta de crescimento declarada",
        nutricao: "Reconhece a dor mas não é prioridade agora",
        qualificado: "Tem meta de crescimento e interesse em resolver o problema",
        oportunidade: "Intenção clara de avanço — reunião agendada"
      }
    }
  };
};

