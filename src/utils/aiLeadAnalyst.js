import { normalizeSegment } from "./segmentClassifier";

/**
 * GrowthHunter — GERADOR DE SCRIPTS HUMANOS REAIS (MÉTODO PROSPECTAGRAM + GABRIEL MIRANDA)
 * Zero linguagem corporativa/robótica.
 * Foco em: Quebra de padrão, observação sincera, micro-CTA de 1 linha, demonstração rápida (vídeo/print).
 */

export const SDR_AGENT_SYSTEM_PROMPT = `
Você é um especialista em prospecção ativa humana no WhatsApp e Ligação para negócios locais.
Regras fundamentais:
- ZERO linguagem corporativa ("somos uma agência 360", "soluções de ponta a ponta").
- Mensagens curtas de 1 a 3 linhas no WhatsApp, como uma pessoa normal conversando.
- Sempre use um gancho visual concreto (ex: "vi vocês no Maps", "montei um rascunho rápido no celular", "gravei 30s da tela").
- Perguntas fáceis e leves de responder.
`;

export const generateAiLeadAnalysis = (company, scores, techResults, websiteScore) => {
  const name = (company.name || "Empresa").replace(/\s*-\s*.*$/, "").trim();
  const city = company.city || "sua cidade";
  const niche = normalizeSegment(company.niche || company.category);
  const rating = company.rating || 4.8;
  const reviewCount = company.review_count || company.reviewsCount || 40;
  const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");
  const websiteUrl = company.website ? company.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : "";

  // 1. DIAGNÓSTICO PRÁTICO (EM PORTUGUÊS CLARO)
  const mainProblem = !hasWebsite
    ? `A ${name} é bem avaliada no Maps (${rating} ⭐ com ${reviewCount} avaliações), mas quem pesquisa por ${niche} no Google cai direto no site dos concorrentes porque vocês não têm página própria cadastrada.`
    : websiteScore.totalScore < 50
    ? `O site da ${name} (${websiteUrl}) demora pra carregar no celular e dificulta o cliente chamar no WhatsApp de primeira.`
    : `O site de vocês é bom, mas na pesquisa do Google por "${niche} em ${city}", apenas os concorrentes aparecem anunciando no topo.`;

  const commercialOpportunity = !hasWebsite
    ? `Criação de Página de Vendas Rápida para WhatsApp`
    : websiteScore.totalScore < 50
    ? `Ajuste e Reformulação do Site no Celular`
    : `Anúncios no Topo do Google (Google Ads)`;

  // 2. ABORDAGEM WHATSAPP — MÉTODO PROSPECTAGRAM / GABRIEL MIRANDA (100% HUMANA)
  const openingMessage = !hasWebsite
    ? `Opa, tudo bem? Vi a ${name} aqui no Google Maps em ${city}, muito bacana as avaliações de vocês! 👏\n\nFui procurar o site ou cardápio/serviços de vocês pra dar uma olhada e reparei que ainda não têm uma página cadastrada.\n\nHoje vocês pegam clientes que buscam no Google ou a demanda vem quase toda por indicação mesmo?`
    : websiteScore.totalScore < 50
    ? `Fala pessoal da ${name}, tudo joia?\n\nDei uma olhada rápida no site de vocês (${websiteUrl}) pelo meu celular agora. Achei a empresa bem estruturada, mas vi que o botão de chamar no WhatsApp demorou um pouco pra carregar aqui.\n\nVocês já tinham percebido isso ou ninguém tinha avisado vocês ainda?`
    : `Opa, tudo bem? Vi o site da ${name} aqui em ${city}, achei super caprichado!\n\nSó reparei que quando a gente pesquisa por "${niche} em ${city}" no Google, os anúncios do topo tão sendo todos da concorrência.\n\nVocês já chegaram a anunciar no Google pra trazer clientes pro Whats ou ainda não é o foco?`;

  const whatsappPitch = openingMessage;

  // 3. SEGUNDO ÂNGULO: MÉTODO GABRIEL MIRANDA (DEMONSTRAÇÃO / VÍDEO PRONTO)
  const visualDemoPitch = !hasWebsite
    ? `Opa! Estava pesquisando empresas de ${niche} aqui em ${city} e vi a boa reputação da ${name}.\n\nComo vi que vocês não têm site próprio, montei um rascunho de 1 página no celular mostrando como ficaria a ${name} recebendo orçamentos no Whats direto do Google.\n\nQuer que eu te mande um print de 30s pra dar uma olhada sem compromisso?`
    : `Opa! Gravei um videozinho rápido de 40 segundos na tela do meu celular mostrando exatamente o que tá travando o carregamento do site da ${name} e como destravar o botão do Whats.\n\nPosso te mandar o link por aqui pra vocês darem uma olhada?`;

  // 4. E-MAIL DIRETO E SEM ENROLAÇÃO
  const emailPitch = {
    subject: !hasWebsite
      ? `Dúvida rápida sobre a ${name} no Google (${city})`
      : `Reparei um detalhe no site da ${name} (${websiteUrl})`,
    body: !hasWebsite
      ? `Oi pessoal da ${name}, tudo bem?\n\nVi que vocês têm ${reviewCount} avaliações muito boas no Google Maps em ${city}.\n\nPorém, quando alguém pesquisa por "${niche} em ${city}" no Google, vocês não aparecem com um site próprio para o cliente chamar no WhatsApp — e os concorrentes acabam pegando essas pessoas.\n\nNós montamos páginas rápidas e diretas focadas em gerar chamadas no WhatsApp.\n\nVocês têm interesse em ver um modelo de exemplo para a ${name} sem compromisso?\n\nAbraço,\n[Seu Nome]`
      : `Oi time da ${name}, tudo joia?\n\nAcessei o site de vocês (${websiteUrl}) pelo celular e achei a proposta bem legal. Só notei que o tempo de abertura do botão do WhatsApp está um pouco lento no mobile, o que faz algumas pessoas desistirem antes de chamar.\n\nTrabalhamos com otimização rápida de sites locais para aumentar as mensagens no WhatsApp.\n\nQuer que eu te envie um diagnóstico de 2 minutos mostrando o que ajustar?\n\nAbraço,\n[Seu Nome]`
  };

  // 5. SCRIPT DE LIGAÇÃO HUMANO (SEM ROTEIRO ROBÓTICO)
  const callScript = [
    `1. Secretária/Atendente: "Opa, bom dia! Tudo bem? Por favor, consigo falar 1 minutinho com o responsável pela empresa ou dono?"`,
    `2. Quando o Dono atender: "Opa ${name}, tudo joia? Te liguei rapidinho porque vi vocês no Google Maps com ${reviewCount} avaliações aqui em ${city} — excelente trabalho de vocês!"`,
    `3. Observação: "${!hasWebsite ? 'Só reparei que vocês não têm um site próprio cadastrado e quem busca pelo serviço no Google acaba caindo nos concorrentes.' : 'Só dei uma olhada no site de vocês e vi que no celular ele tá demorando um pouco pra abrir o WhatsApp.'}"`,
    `4. Pergunta leve: "Hoje vocês já têm alguém olhando essa parte ou tá parado por aí?"`,
    `5. Fechamento leve: "Montei um rascunho/vídeo de 1 minuto mostrando como resolver. Posso te mandar no WhatsApp pra você dar uma olhada sem compromisso?"`
  ].join("\n");

  // 6. CADÊNCIA DE FOLLOW-UP HUMANA (MÉTODO PROSPECTAGRAM: MENSAGENS CURTAS + ÁUDIO)
  const followUpSequence = [
    {
      day: "D0", 
      title: "1º Contato (WhatsApp Curto)",
      script: openingMessage
    },
    {
      day: "D2", 
      title: "Follow-up Rápido (Quebra de Gelo)",
      script: `Opa, tudo bem? Conseguiu ver a mensagem que te mandei acima? 🙂`
    },
    {
      day: "D4", 
      title: "Gancho Visual / Modelo Pronto",
      script: visualDemoPitch
    },
    {
      day: "D7", 
      title: "Script para Gravar Áudio (30s)",
      script: `🎙️ [GRAVAR ÁUDIO DE 25-35 SEGUNDOS]:\n"Fala ${name}, tudo joia? Mandei mensagem aí esses dias... gravei esse áudio rapidinho só pra te explicar: vi que vocês têm bastante avaliação boa no Google Maps aqui em ${city}, mas quem pesquisa pelo serviço no celular não acha o site de vocês. Rascunhei um modelo bem clean pra vocês receberem orçamentos direto no WhatsApp. Se quiser dar uma olhada, me dá um toque que te mando aqui sem compromisso nenhum. Valeu!"`
    },
    {
      day: "D10", 
      title: "Pergunta Direta e Leve",
      script: `Oi! Só pra eu não insistir se não fizer sentido: colocar um site no ar ou anunciar no Google é algo que tá no radar de vocês esse mês ou a agenda já tá cheia por aí?`
    },
    {
      day: "D14", 
      title: "Breakup Humanizado (Despedida Amigável)",
      script: `Imagino que a rotina esteja corrida por aí! Não vou mais encher seu saco haha. Se um dia quiserem colocar um site no ar ou pegar clientes do Google, é só me dar um alô aqui. Sucesso pra ${name}! 🤝`
    }
  ];

  // 7. TRATAMENTO HUMANO DE OBJEÇÕES
  const objections = [
    {
      objection: "Já temos agência / já temos quem faça",
      response: `Ah que massa! E eles tão focando em colocar vocês no topo do Google pra quem pesquisa em ${city}, ou tão mais cuidando das postagens de Instagram?`
    },
    {
      objection: "Não tenho interesse agora",
      response: `Tranquilo, sem crise nenhuma! É porque vocês já tão com a agenda cheia por aí ou porque já tiveram alguma experiência ruim com isso antes?`
    },
    {
      objection: "Quanto custa?",
      response: `Cara, depende do que você precisa, mas é bem acessível. Uma página rápida pra receber orçamentos no Whats fica na faixa de R$ 1.500 a R$ 2.500 em parcela única, sem mensalidade presa. Quer que eu te mostre o modelo pra ver se faz sentido pro seu negócio?`
    },
    {
      objection: "Me manda a proposta por aqui",
      response: `Mando sim! Só me diz uma coisa rápida pra eu te mandar o que faz mais sentido: hoje o maior objetivo de vocês seria aparecer no Google pra quem busca na cidade ou passar mais autoridade pra quem já chega no WhatsApp?`
    },
    {
      objection: "Vou ver com meu sócio / vou pensar",
      response: `Show de bola! Quer que eu te mande o print do modelo pra você mostrar pra ele? Ajuda bastante a visualizar como fica.`
    }
  ];

  const nextAction = !hasWebsite
    ? "Enviar mensagem curta de abertura D0 no WhatsApp perguntando se atendem clientes do Google"
    : websiteScore.totalScore < 50
    ? "Enviar aviso sincero sobre a lentidão do botão de WhatsApp no celular"
    : "Perguntar se já testaram anúncios no Google para quem pesquisa na cidade";

  return {
    summary: `${name} (${niche} em ${city}) — Avaliação: ${rating} ⭐ (${reviewCount} opiniões).`,
    main_problem: mainProblem,
    commercial_opportunity: commercialOpportunity,
    recommended_service: scores.primaryOffer?.title || (hasWebsite ? "Reformulação / Tráfego" : "Criação de Landing Page"),
    priority: scores.classification,
    sales_angle: mainProblem,
    opening_message: openingMessage,
    visualDemoPitch,
    whatsappPitch,
    emailPitch,
    callScript,
    followUpSequence,
    objections,
    next_action: nextAction,
    sdrFramework: {
      diagnostico: { empresa: name, nicho: niche, cidade: city, avaliacoes: `${rating} ⭐ (${reviewCount})`, dorPrincipal: mainProblem },
      estrategia: { canal: "WhatsApp (Curto) → Áudio (30s) → Demonstração", microCta: "Hoje vocês pegam clientes pelo Google ou vem tudo por indicação?", oferta: commercialOpportunity },
      qualificacao: {
        desqualificado: "Sem interesse real e operação parada",
        nutricao: "Gostou da ideia mas está sem tempo agora",
        qualificado: "Pediu para ver o modelo/vídeo",
        oportunidade: "Quer proposta e reunião de fechamento"
      }
    }
  };
};
