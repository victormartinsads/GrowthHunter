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
let currentQrCodeDataUrl = null;
let sessionState = {
  status: "DISCONNECTED", // "DISCONNECTED" | "SCAN_QR" | "CONNECTING" | "CONNECTED"
  phone: "",
  profileName: "",
  connectedAt: null,
  battery: 100
};

// Armazenamento 100% REAL de conversas e mensagens
let chatsStore = new Map(); // key: phone, value: { phone, name, lastMessage, timestamp, unreadCount }
let messagesStore = []; // array de { id, phone, name, direction, content, timestamp, status }

let automationRules = {
  welcomeEnabled: true,
  welcomeMessage: "Olá! Obrigado pelo contato com a nossa equipe. Como podemos te ajudar hoje?",
  officeHoursEnabled: true,
  officeHoursStart: "08:00",
  officeHoursEnd: "18:00",
  officeHoursMessage: "Olá! Nosso horário de atendimento é de Segunda a Sexta das 08h às 18h. Responderemos assim que possível!",
  keywordRules: [
    {
      id: "rule_preco",
      keyword: "preço, valor, quanto custa, orçamento",
      replyText: "Trabalhamos com projetos sob medida para o seu nicho! Para te passar a proposta exata, qual é o segmento da sua empresa e a cidade?",
      enabled: true
    },
    {
      id: "rule_reuniao",
      keyword: "reunião, agendar, horário, marcar",
      replyText: "Excelente! Tenho horários disponíveis amanhã às 14h ou 16h para uma apresentação rápida de 15 minutos. Qual fica melhor para você?",
      enabled: true
    },
    {
      id: "rule_site",
      keyword: "site, landing page, reformulação",
      replyText: "Desenvolvemos páginas ultra-rápidas otimizadas para celular com botão direto de WhatsApp e Meta Pixel configurado. Quer que eu te envie 2 exemplos reais?",
      enabled: true
    }
  ]
};

export async function initWhatsAppBaileys() {
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: state,
      browser: ["GrowthHunter CRM", "Chrome", "1.0.0"],
      syncFullHistory: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📸 [Baileys] Novo QR Code REAL gerado pelo WhatsApp Web Socket.");
        currentQrCodeDataUrl = await QRCode.toDataURL(qr, { scale: 8, margin: 2 });
        sessionState.status = "SCAN_QR";
      }

      if (connection === "connecting") {
        sessionState.status = "CONNECTING";
        console.log("🔄 [Baileys] Conectando ao WhatsApp...");
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
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`❌ [Baileys] Conexão encerrada (código: ${statusCode}). Reconectar: ${shouldReconnect}`);

        if (shouldReconnect) {
          sessionState.status = "CONNECTING";
          setTimeout(() => initWhatsAppBaileys(), 3000);
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

    // Escuta contatos sincronizados
    sock.ev.on("contacts.upsert", (contacts) => {
      for (const contact of contacts) {
        if (!contact.id || contact.id.includes("@g.us")) continue; // ignora grupos
        const phone = contact.id.split("@")[0].replace(/\D/g, "");
        if (!phone) continue;

        const name = contact.notify || contact.name || contact.verifiedName || `+${phone}`;
        const existing = chatsStore.get(phone) || {};
        chatsStore.set(phone, {
          phone,
          name: name,
          lastMessage: existing.lastMessage || "",
          timestamp: existing.timestamp || new Date().toISOString(),
          unreadCount: existing.unreadCount || 0
        });
      }
    });

    // Escuta mensagens recebidas e enviadas reais (Inbound & Outbound)
    sock.ev.on("messages.upsert", async ({ messages: newMessages, type }) => {
      for (const msg of newMessages) {
        if (!msg.message) continue;

        const senderJid = msg.key.remoteJid || "";
        if (senderJid.includes("@g.us") || senderJid === "status@broadcast") continue; // ignora grupos e status

        const cleanPhone = senderJid.replace("@s.whatsapp.net", "").replace(/\D/g, "");
        if (!cleanPhone) continue;

        const textContent = msg.message?.conversation || 
                            msg.message?.extendedTextMessage?.text || 
                            msg.message?.imageMessage?.caption || 
                            (msg.message?.imageMessage ? "📷 Imagem" : "") ||
                            (msg.message?.audioMessage ? "🎵 Áudio" : "") ||
                            (msg.message?.documentMessage ? "📄 Documento" : "") ||
                            "";

        if (!textContent) continue;

        const isFromMe = Boolean(msg.key.fromMe);
        const contactName = msg.pushName || `+${cleanPhone}`;

        console.log(`📩 [WhatsApp ${isFromMe ? "ENVIADO" : "RECEBIDO"} | +${cleanPhone}]: ${textContent}`);

        const storedMsg = {
          id: msg.key.id || `msg_${Date.now()}`,
          phone: cleanPhone,
          contactName: contactName,
          direction: isFromMe ? "OUTBOUND" : "INBOUND",
          content: textContent,
          timestamp: msg.messageTimestamp ? new Date(Number(msg.messageTimestamp) * 1000).toISOString() : new Date().toISOString(),
          status: isFromMe ? "SENT" : "DELIVERED"
        };

        // Evita duplicatas
        if (!messagesStore.some(m => m.id === storedMsg.id)) {
          messagesStore.push(storedMsg);
        }

        // Atualiza a lista de conversas reais
        const existingChat = chatsStore.get(cleanPhone) || {};
        chatsStore.set(cleanPhone, {
          phone: cleanPhone,
          name: existingChat.name && !existingChat.name.startsWith("+") ? existingChat.name : contactName,
          lastMessage: textContent,
          timestamp: storedMsg.timestamp,
          unreadCount: isFromMe ? 0 : (existingChat.unreadCount || 0) + 1
        });

        // Se for mensagem recebida de cliente, processar regras de automação
        if (!isFromMe && type === "notify") {
          await processAutomationReply(cleanPhone, textContent);
        }
      }
    });

  } catch (err) {
    console.error("Erro ao iniciar Baileys WhatsApp Socket:", err);
    sessionState.status = "DISCONNECTED";
  }
}

// Processa auto-respostas
async function processAutomationReply(phone, incomingText) {
  if (!sock || sessionState.status !== "CONNECTED") return;

  const lower = incomingText.toLowerCase();

  // 1. Keyword Rules Match
  for (const rule of automationRules.keywordRules) {
    if (!rule.enabled) continue;
    const keywords = rule.keyword.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
    const hasMatch = keywords.some(k => lower.includes(k));

    if (hasMatch) {
      console.log(`🤖 [Auto-Reply Keyword Trigger]: respondendo regra "${rule.keyword}" para +${phone}`);
      await sendWhatsAppRealMessage(phone, rule.replyText);
      return;
    }
  }

  // 2. Office Hours Check
  if (automationRules.officeHoursEnabled) {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const [startH, startM] = automationRules.officeHoursStart.split(":").map(Number);
    const [endH, endM] = automationRules.officeHoursEnd.split(":").map(Number);
    const startVal = startH + (startM || 0) / 60;
    const endVal = endH + (endM || 0) / 60;

    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isOutOfHours = isWeekend || currentHour < startVal || currentHour > endVal;

    if (isOutOfHours) {
      console.log(`🌙 [Auto-Reply Fora do Horário]: respondendo para +${phone}`);
      await sendWhatsAppRealMessage(phone, automationRules.officeHoursMessage);
      return;
    }
  }
}

// Envio de mensagem real via Baileys
export async function sendWhatsAppRealMessage(phone, messageText) {
  let cleanPhone = String(phone).replace(/\D/g, "");
  if (!cleanPhone || !messageText) return { success: false, error: "Telefone ou mensagem inválidos." };

  // Se o número não tiver DDI (ex: 11999998888 com 10 ou 11 dígitos), adiciona 55 (Brasil)
  if (!cleanPhone.startsWith("55") && !cleanPhone.startsWith("351") && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
    cleanPhone = "55" + cleanPhone;
  }

  let targetJid = `${cleanPhone}@s.whatsapp.net`;

  try {
    if (sock && sessionState.status === "CONNECTED") {
      // 1. Resolve o JID oficial exato via WhatsApp directory (resolve 9º dígito do Brasil automaticamente)
      try {
        const onWaResult = await sock.onWhatsApp(cleanPhone);
        if (onWaResult && onWaResult.length > 0 && onWaResult[0]?.exists && onWaResult[0]?.jid) {
          targetJid = onWaResult[0].jid;
          console.log(`🎯 [Baileys] JID verificado e validado pelo WhatsApp: ${targetJid}`);
        }
      } catch (e) {
        console.log("Nota: verificação onWhatsApp não retornou JID específico, usando padrão:", targetJid);
      }

      // 2. Dispara a mensagem via WebSocket
      const sentMsg = await sock.sendMessage(targetJid, { text: messageText });
      console.log(`🚀 [Baileys] Mensagem REAL entregue para ${targetJid}: "${messageText}"`);

      const newMsg = {
        id: sentMsg?.key?.id || `out_${Date.now()}`,
        phone: cleanPhone,
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
      const existing = chatsStore.get(cleanPhone) || {};
      chatsStore.set(cleanPhone, {
        phone: cleanPhone,
        name: existing.name || `+${cleanPhone}`,
        lastMessage: messageText,
        timestamp: newMsg.timestamp,
        unreadCount: 0
      });

      return { success: true, messageId: newMsg.id, status: "SENT", jid: targetJid };
    } else {
      console.warn(`⚠️ WhatsApp desconectado ao tentar enviar para +${cleanPhone}`);
      return { success: false, error: "WhatsApp desconectado. Conecte pelo QR Code antes de enviar." };
    }
  } catch (err) {
    console.error(`❌ Erro ao enviar mensagem Baileys para +${cleanPhone}:`, err);
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
    return messagesStore.filter(m => m.phone === clean);
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
