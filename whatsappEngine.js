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

let messagesStore = [];
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
      syncFullHistory: false
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

    // Escuta mensagens recebidas (Inbound)
    sock.ev.on("messages.upsert", async ({ messages: newMessages, type }) => {
      if (type !== "notify") return;

      for (const msg of newMessages) {
        if (!msg.message || msg.key.fromMe) continue;

        const senderJid = msg.key.remoteJid;
        const cleanPhone = senderJid.replace("@s.whatsapp.net", "").replace(/\D/g, "");
        const textContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        if (!textContent) continue;

        console.log(`📩 [WhatsApp Recebido de +${cleanPhone}]: ${textContent}`);

        const storedMsg = {
          id: msg.key.id || `in_${Date.now()}`,
          phone: cleanPhone,
          companyName: msg.pushName || "Contato",
          direction: "INBOUND",
          content: textContent,
          timestamp: new Date().toISOString(),
          status: "DELIVERED"
        };
        messagesStore.push(storedMsg);

        // Avaliar Regras de Automação
        await processAutomationReply(cleanPhone, textContent);
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
  const cleanPhone = String(phone).replace(/\D/g, "");
  if (!cleanPhone || !messageText) return { success: false, error: "Dados inválidos." };

  const targetJid = `${cleanPhone}@s.whatsapp.net`;

  try {
    if (sock && sessionState.status === "CONNECTED") {
      await sock.sendMessage(targetJid, { text: messageText });
      console.log(`🚀 [Baileys] Mensagem REAL enviada para +${cleanPhone}: "${messageText.slice(0, 40)}..."`);
    } else {
      console.log(`📝 [Simulação/Offline] Mensagem salva localmente para +${cleanPhone}: "${messageText.slice(0, 40)}..."`);
    }

    const newMsg = {
      id: `out_${Date.now()}`,
      phone: cleanPhone,
      companyName: "Lead",
      direction: "OUTBOUND",
      content: messageText,
      timestamp: new Date().toISOString(),
      status: "SENT"
    };
    messagesStore.push(newMsg);

    return { success: true, messageId: newMsg.id, status: "SENT" };
  } catch (err) {
    console.error(`Erro ao enviar mensagem Baileys para +${cleanPhone}:`, err);
    return { success: false, error: err.message };
  }
}

export function getWhatsAppSession() {
  return {
    ...sessionState,
    qrCode: currentQrCodeDataUrl
  };
}

export function getStoredMessages() {
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
  
  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (e) {}

  return { success: true };
}
