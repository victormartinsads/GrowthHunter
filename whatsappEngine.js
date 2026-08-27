import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion 
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import pino from "pino";
import fs from "fs";
import path from "path";

const AUTH_DIR = path.resolve("./baileys_auth_info");

let sock = null;
let isInitializing = false;
let currentQrCodeDataUrl = null;
let sessionState = {
  status: "DISCONNECTED", // "DISCONNECTED" | "SCAN_QR" | "CONNECTING" | "CONNECTED"
  phone: "",
  profileName: "",
  connectedAt: null,
  battery: 100
};

// Armazenamento de conversas e mensagens
let chatsStore = new Map(); // key: phone or JID, value: { jid, phone, name, lastMessage, timestamp, unreadCount }
let messagesStore = []; // array de { id, jid, phone, contactName, direction, content, timestamp, status }

// Auto-respostas DESATIVADAS por padrão conforme solicitado
let automationRules = {
  welcomeEnabled: false,
  welcomeMessage: "Olá! Obrigado pelo contato com a nossa equipe. Como podemos te ajudar hoje?",
  officeHoursEnabled: false,
  officeHoursStart: "08:00",
  officeHoursEnd: "18:00",
  officeHoursMessage: "Olá! Nosso horário de atendimento é de Segunda a Sexta das 08h às 18h. Responderemos assim que possível!",
  keywordRules: [
    {
      id: "rule_preco",
      keyword: "preço, valor, quanto custa, orçamento",
      replyText: "Trabalhamos com projetos sob medida para o seu nicho! Para te passar a proposta exata, qual é o segmento da sua empresa e a cidade?",
      enabled: false
    },
    {
      id: "rule_reuniao",
      keyword: "reunião, agendar, horário, marcar",
      replyText: "Excelente! Tenho horários disponíveis amanhã às 14h ou 16h para uma apresentação rápida de 15 minutos. Qual fica melhor para você?",
      enabled: false
    },
    {
      id: "rule_site",
      keyword: "site, landing page, reformulação",
      replyText: "Desenvolvemos páginas ultra-rápidas otimizadas para celular com botão direto de WhatsApp e Meta Pixel configurado. Quer que eu te envie 2 exemplos reais?",
      enabled: false
    }
  ]
};

export async function initWhatsAppBaileys() {
  if (isInitializing) {
    console.log("⏳ [Baileys] Inicialização já em andamento, aguardando...");
    return;
  }
  isInitializing = true;

  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    if (sock) {
      try {
        sock.ev.removeAllListeners();
      } catch (e) {}
    }

    sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: state,
      browser: ["Windows", "Chrome", "122.0.6261.128"],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 25000,
      retryRequestDelayMs: 250,
      markOnlineOnConnect: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📸 [Baileys] Novo QR Code gerado.");
        currentQrCodeDataUrl = await QRCode.toDataURL(qr, { scale: 8, margin: 2 });
        sessionState.status = "SCAN_QR";
      }

      if (connection === "connecting") {
        sessionState.status = "CONNECTING";
      }

      if (connection === "open") {
        console.log("✅ [Baileys] WhatsApp REAL CONECTADO com Sucesso!");
        const userJid = sock.user?.id || "";
        const cleanPhone = userJid.split(":")[0].split("@")[0];
        
        sessionState = {
          status: "CONNECTED",
          phone: cleanPhone,
          profileName: sock.user?.name || "WhatsApp Business",
          connectedAt: new Date().toISOString(),
          battery: 98
        };
        currentQrCodeDataUrl = null;
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(`⚠️ [Baileys] Conexão fechada (código: ${statusCode}). Deslogado: ${isLoggedOut}`);

        if (!isLoggedOut) {
          sessionState.status = "CONNECTING";
          setTimeout(() => {
            isInitializing = false;
            initWhatsAppBaileys();
          }, 3000);
        } else {
          sessionState.status = "DISCONNECTED";
          sessionState.phone = "";
          sessionState.profileName = "";
          currentQrCodeDataUrl = null;
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (e) {}
        }
      }
    });

    // Escuta mensagens recebidas e enviadas reais
    sock.ev.on("messages.upsert", async ({ messages: newMessages, type }) => {
      for (const msg of newMessages) {
        if (!msg.message) continue;

        const senderJid = msg.key.remoteJid || "";
        if (senderJid.includes("@g.us") || senderJid === "status@broadcast") continue;

        const cleanPhone = senderJid.replace("@s.whatsapp.net", "").replace("@lid", "").replace(/\D/g, "");
        if (!cleanPhone && !senderJid) continue;

        const textContent = msg.message?.conversation || 
                            msg.message?.extendedTextMessage?.text || 
                            msg.message?.imageMessage?.caption || 
                            (msg.message?.imageMessage ? "📷 Imagem" : "") ||
                            (msg.message?.audioMessage ? "🎵 Áudio" : "") ||
                            (msg.message?.documentMessage ? "📄 Documento" : "") ||
                            "";

        if (!textContent) continue;

        const isFromMe = Boolean(msg.key.fromMe);
        const contactName = msg.pushName || (cleanPhone ? `+${cleanPhone}` : "Contato");

        console.log(`📩 [WhatsApp ${isFromMe ? "ENVIADO" : "RECEBIDO"} | ${senderJid}]: ${textContent}`);

        const storedMsg = {
          id: msg.key.id || `msg_${Date.now()}`,
          jid: senderJid,
          phone: cleanPhone || senderJid,
          contactName: contactName,
          direction: isFromMe ? "OUTBOUND" : "INBOUND",
          content: textContent,
          timestamp: msg.messageTimestamp ? new Date(Number(msg.messageTimestamp) * 1000).toISOString() : new Date().toISOString(),
          status: isFromMe ? "SENT" : "DELIVERED"
        };

        if (!messagesStore.some(m => m.id === storedMsg.id)) {
          messagesStore.push(storedMsg);
        }

        // Mapeia tanto pelo telefone quanto pelo JID para envio infalível
        const chatKey = cleanPhone || senderJid;
        const existingChat = chatsStore.get(chatKey) || {};
        chatsStore.set(chatKey, {
          jid: senderJid,
          phone: chatKey,
          name: existingChat.name && !existingChat.name.startsWith("+") ? existingChat.name : contactName,
          lastMessage: textContent,
          timestamp: storedMsg.timestamp,
          unreadCount: isFromMe ? 0 : (existingChat.unreadCount || 0) + 1
        });
      }
    });

  } catch (err) {
    console.error("Erro ao iniciar Baileys WhatsApp Socket:", err);
    sessionState.status = "DISCONNECTED";
  } finally {
    isInitializing = false;
  }
}

// Envio de mensagem real via Baileys
export async function sendWhatsAppRealMessage(targetInput, messageText) {
  if (!targetInput || !messageText) return { success: false, error: "Destinatário ou mensagem vazia." };

  const rawStr = String(targetInput).trim();
  let cleanDigits = rawStr.replace(/\D/g, "");
  let targetJid = "";

  // 1. Verifica se já temos o JID salvo no chatsStore
  const knownChat = chatsStore.get(cleanDigits) || chatsStore.get(rawStr);
  if (knownChat && knownChat.jid) {
    targetJid = knownChat.jid;
  } else if (rawStr.includes("@")) {
    targetJid = rawStr;
  } else {
    // Adiciona DDI 55 do Brasil se necessário
    if (!cleanDigits.startsWith("55") && !cleanDigits.startsWith("351") && (cleanDigits.length === 10 || cleanDigits.length === 11)) {
      cleanDigits = "55" + cleanDigits;
    }
    targetJid = `${cleanDigits}@s.whatsapp.net`;
  }

  try {
    if (!sock || sessionState.status !== "CONNECTED") {
      return { success: false, error: "WhatsApp não está conectado. Escaneie o QR Code primeiro." };
    }

    // Se o JID for padrão @s.whatsapp.net, valida no diretório do WhatsApp
    if (targetJid.endsWith("@s.whatsapp.net") && cleanDigits) {
      try {
        const onWaResult = await sock.onWhatsApp(cleanDigits);
        if (onWaResult && onWaResult.length > 0 && onWaResult[0]?.exists && onWaResult[0]?.jid) {
          targetJid = onWaResult[0].jid;
        }
      } catch (e) {}
    }

    console.log(`🚀 [Baileys] Enviando mensagem REAL para ${targetJid}: "${messageText}"`);
    const sentMsg = await sock.sendMessage(targetJid, { text: messageText });

    const newMsg = {
      id: sentMsg?.key?.id || `out_${Date.now()}`,
      jid: targetJid,
      phone: cleanDigits || targetJid,
      contactName: "Lead",
      direction: "OUTBOUND",
      content: messageText,
      timestamp: new Date().toISOString(),
      status: "SENT"
    };

    if (!messagesStore.some(m => m.id === newMsg.id)) {
      messagesStore.push(newMsg);
    }

    // Atualiza chat
    const chatKey = cleanDigits || targetJid;
    const existing = chatsStore.get(chatKey) || {};
    chatsStore.set(chatKey, {
      jid: targetJid,
      phone: chatKey,
      name: existing.name || `+${chatKey}`,
      lastMessage: messageText,
      timestamp: newMsg.timestamp,
      unreadCount: 0
    });

    return { success: true, messageId: newMsg.id, status: "SENT", jid: targetJid };
  } catch (err) {
    console.error(`❌ Erro ao enviar mensagem Baileys para ${targetJid}:`, err);
    return { success: false, error: err.message };
  }
}

export function getWhatsAppSession() {
  return {
    ...sessionState,
    qrCode: currentQrCodeDataUrl
  };
}

export function getRealChats() {
  return Array.from(chatsStore.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function getStoredMessages(phoneFilter = null) {
  if (phoneFilter) {
    const clean = String(phoneFilter).replace(/\D/g, "");
    return messagesStore.filter(m => m.phone === clean || m.jid === phoneFilter || m.phone === phoneFilter);
  }
  return messagesStore;
}

export function getAutomationRules() {
  return automationRules;
}

export function updateAutomationRules(newRules) {
  automationRules = { ...automationRules, ...newRules };
  return automationRules;
}

export async function disconnectWhatsAppSession() {
  try {
    if (sock) {
      await sock.logout();
      sock.ev.removeAllListeners();
      sock = null;
    }
  } catch (e) {}

  sessionState.status = "DISCONNECTED";
  sessionState.phone = "";
  sessionState.profileName = "";
  currentQrCodeDataUrl = null;
  chatsStore.clear();
  messagesStore = [];
  
  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (e) {}

  return { success: true };
}
