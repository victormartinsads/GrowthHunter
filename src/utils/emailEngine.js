import { normalizeSegment } from "./segmentClassifier";

/**
 * Gerador de E-mails Frios B2B & Abordagens de WhatsApp
 * Focado Primariamente na VENDA DE SITES (Foco 1) e GOOGLE ADS (Foco 2)
 */
export const generateColdEmail = (lead, senderName = "Alexandre", senderAgency = "Agência LeadFlow") => {
  const empresa = lead.name || "Sua Empresa";
  const nicho = normalizeSegment(lead.niche);
  const cidade = lead.city || "sua região";
  const site = lead.website || "seu site";
  const audit = String(lead.digitalAudit || "").toLowerCase();
  const hasWebsite = Boolean(lead.website && String(lead.website).trim() !== "");

  let subjectOptions = [];
  let bodyText = "";

  if (!hasWebsite) {
    subjectOptions = [
      `Criação de Website + Google Ads para a ${empresa} em ${cidade}`,
      `Dúvida sobre a presença digital da ${empresa} no Google`,
      `Oportunidade de captação de clientes para a ${empresa}`
    ];

    bodyText = `Olá equipe da ${empresa}, tudo bem?\n\nMe chamo ${senderName}, sou especialista em criação de Websites de Alta Conversão e Tráfego Pago no Google Ads para empresas de ${nicho}.\n\nMapeando as empresas de ${cidade}, notei que a ${empresa} ainda não possui um site otimizado para captar clientes que pesquisam no Google por ${nicho}.\n\nEnquanto isso, seus concorrentes diretos estão investindo em links patrocinados no topo das buscas e ficando com esses clientes todos os dias.\n\nDesenvolvemos um projeto completo:\n1. Criação de Landing Page de Alta Conversão (Otimizada para Celular & WhatsApp)\n2. Configuração e Lançamento de Campanhas de Pesquisa no Google Ads\n\nEssa estrutura entrega de 15 a 35 novos pedidos de orçamento no WhatsApp da sua recepção todos os meses.\n\nPodemos agendar uma conversa rápida de 10 minutos nesta semana para eu te apresentar um projeto sem compromisso?\n\nAtenciosamente,\n${senderName}\n${senderAgency}`;
  } else {
    subjectOptions = [
      `Reformulação de Site + Google Ads para a ${empresa}`,
      `Análise rápida do site da ${empresa} (${site})`,
      `Como gerar mais contatos no WhatsApp da ${empresa} via Google Ads`
    ];

    bodyText = `Olá equipe da ${empresa}, tudo bem?\n\nMe chamo ${senderName}, especialista em otimização de Websites e gestão de tráfego pago no Google Ads para o segmento de ${nicho}.\n\nAnalisei o site da ${empresa} (${site}) e notei que vocês oferecem um excelente serviço em ${cidade}. No entanto, identificamos 2 pontos de melhoria que estão fazendo o site de vocês perder orçamentos:\n\n1. Falta de botão flutuante direto para chamada no WhatsApp\n2. Falta de campanhas ativas no topo da pesquisa do Google Ads quando o cliente procura na cidade\n\nNós ajudamos empresas de ${nicho} a reformularem seus sites para converterem até 3x mais visitantes em mensagens no WhatsApp, além de escalar o volume de leads com Google Ads.\n\nVocê teria 10 minutos nesta semana para eu te mostrar um diagnóstico completo sem custo?\n\nAtenciosamente,\n${senderName}\n${senderAgency}`;
  }

  const chosenSubject = subjectOptions[0];
  const mailtoUrl = lead.email 
    ? `mailto:${lead.email}?subject=${encodeURIComponent(chosenSubject)}&body=${encodeURIComponent(bodyText)}`
    : null;

  return {
    subject: chosenSubject,
    body: bodyText,
    mailtoUrl,
    recipientEmail: lead.email || ""
  };
};

export const generatePersuasiveWhatsappMessage = (lead, senderName = "Alexandre") => {
  const empresa = lead.name || "empresa";
  const nicho = normalizeSegment(lead.niche);
  const cidade = lead.city || "sua região";
  const hasWebsite = Boolean(lead.website && String(lead.website).trim() !== "");

  if (!hasWebsite) {
    return `Olá equipe da *${empresa}*! Tudo bem? Me chamo ${senderName}, sou especialista em *Criação de Sites de Alta Conversão e Google Ads* para *${nicho}*.\n\nAnalisando as empresas de *${cidade}*, notei que a ${empresa} ainda não tem um site para aparecer quando potenciais clientes pesquisam por seus serviços no Google.\n\nEnquanto isso, a concorrência na cidade está captando esses clientes diariamente via anúncios patrocinados.\n\nDesenvolvemos uma solução completa: *Criação de Landing Page Profissional + Anúncios no Google Ads* para entregar de 15 a 35 novos orçamentos no WhatsApp da sua recepção todos os meses.\n\nVocê teria 10 minutos essa semana pra eu te enviar uma proposta de site sem compromisso?`;
  }

  return `Oi pessoal da *${empresa}*! Tudo certo? Me chamo ${senderName}, especialista em otimização de *Websites e Google Ads* para *${nicho}*.\n\nDei uma olhada no site de vocês (${lead.website}) e achei a empresa excelente. Porém, identifiquei 2 falhas no site que estão fazendo vocês queimarem orçamento sem converter os visitantes em chamadas no WhatsApp.\n\nNós reformulamos sites para dobrar a conversão no WhatsApp e ativamos campanhas no topo do Google Ads em *${cidade}*.\n\nPosso te mandar um diagnóstico curto de 2 minutos mostrando como corrigir o site?`;
};
