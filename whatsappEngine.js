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
  avatar: null,
  connectedAt: null,
  battery: 100
};

// Armazenamento de conversas e mensagens
let chatsStore = new Map(); // key: phone or JID, value: { jid, phone, name, avatar, lastMessage, timestamp, unreadCount }
let messagesStore = []; // array de { id, jid, phone, contactName, direction, type, content, mediaUrl, fileName, timestamp, status }

let automationRules = {
  welcomeEnabled: false,
  welcomeMessage: "Olá! Obrigado pelo contato com a nossa equipe. Como podemos te ajudar hoje?",
  officeHoursEnabled: false,
  officeHoursStart: "08:00",
  officeHoursEnd: "18:00",
  officeHoursMessage: "Olá! Nosso horário de atendimento é de Segunda a Sexta das 08h às 18h. Responderemos assim que possível!",
  keywordRules: []
};

// Função auxiliar para buscar foto de perfil oficial no WhatsApp
export async function fetchProfilePicture(jid) {
  try {
    if (sock && sessionState.status === "CONNECTED" && jid) {
      return await sock.profilePictureUrl(jid, "image");
    }
  } catch (e) {}
  return null;
}

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
        
        let myAvatar = null;
        try {
          myAvatar = await sock.profilePictureUrl(userJid, "image");
        } catch (e) {}

        sessionState = {
          status: "CONNECTED",
          phone: cleanPhone,
          profileName: sock.user?.name || "WhatsApp Business",
          avatar: myAvatar,
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
          sessionState.avatar = null;
          currentQrCodeDataUrl = null;
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (e) {}
        }
      }
    });

    // Escuta mensagens recebidas e enviadas reais
    sock.ev.on("messages.upsert", async ({ messages: newMessages }) => {
      for (const msg of newMessages) {
        if (!msg.message) continue;

        const senderJid = msg.key.remoteJid || "";
        if (senderJid.includes("@g.us") || senderJid === "status@broadcast") continue;

        const cleanPhone = senderJid.replace("@s.whatsapp.net", "").replace("@lid", "").replace(/\D/g, "");
        if (!cleanPhone && !senderJid) continue;

        const isAudio = Boolean(msg.message?.audioMessage);
        const isImage = Boolean(msg.message?.imageMessage);
        const isDocument = Boolean(msg.message?.documentMessage);
        const isVideo = Boolean(msg.message?.videoMessage);

        let type = "TEXT";
        let textContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        if (isAudio) {
          type = "AUDIO";
          textContent = "🎙️ Mensagem de Áudio";
        } else if (isImage) {
          type = "IMAGE";
          textContent = msg.message.imageMessage.caption ? `📷 ${msg.message.imageMessage.caption}` : "📷 Foto";
        } else if (isDocument) {
          type = "DOCUMENT";
          const docName = msg.message.documentMessage.fileName || "Documento";
          textContent = `📄 ${docName}`;
        } else if (isVideo) {
          type = "VIDEO";
          textContent = "🎥 Vídeo";
        }

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
          type: type,
          content: textContent,
          timestamp: msg.messageTimestamp ? new Date(Number(msg.messageTimestamp) * 1000).toISOString() : new Date().toISOString(),
          status: isFromMe ? "SENT" : "DELIVERED"
        };

        if (!messagesStore.some(m => m.id === storedMsg.id)) {
          messagesStore.push(storedMsg);
        }

        const chatKey = cleanPhone || senderJid;
        const existingChat = chatsStore.get(chatKey) || {};

        chatsStore.set(chatKey, {
          jid: senderJid,
          phone: chatKey,
          name: existingChat.name && !existingChat.name.startsWith("+") ? existingChat.name : contactName,
          avatar: existingChat.avatar || null,
          lastMessage: textContent,
          timestamp: storedMsg.timestamp,
          unreadCount: isFromMe ? 0 : (existingChat.unreadCount || 0) + 1
        });

        // Tenta buscar a foto de perfil assincronamente se ainda não tiver
        if (!existingChat.avatar) {
          fetchProfilePicture(senderJid).then(avatarUrl => {
            if (avatarUrl) {
              const c = chatsStore.get(chatKey);
              if (c) {
                c.avatar = avatarUrl;
                chatsStore.set(chatKey, c);
              }
            }
          }).catch(() => {});
        }
      }
    });

  } catch (err) {
    console.error("Erro ao iniciar Baileys WhatsApp Socket:", err);
    sessionState.status = "DISCONNECTED";
  } finally {
    isInitializing = false;
  }
}

// Auxiliar para obter JID de destino
async function resolveTargetJid(targetInput) {
  const rawStr = String(targetInput).trim();
  let cleanDigits = rawStr.replace(/\D/g, "");
  let targetJid = "";

  const knownChat = chatsStore.get(cleanDigits) || chatsStore.get(rawStr);
  if (knownChat && knownChat.jid) {
    targetJid = knownChat.jid;
  } else if (rawStr.includes("@")) {
    targetJid = rawStr;
  } else {
    if (!cleanDigits.startsWith("55") && !cleanDigits.startsWith("351") && (cleanDigits.length === 10 || cleanDigits.length === 11)) {
      cleanDigits = "55" + cleanDigits;
    }
    targetJid = `${cleanDigits}@s.whatsapp.net`;
  }

  if (sock && sessionState.status === "CONNECTED" && targetJid.endsWith("@s.whatsapp.net") && cleanDigits) {
    try {
      const onWaResult = await sock.onWhatsApp(cleanDigits);
      if (onWaResult && onWaResult.length > 0 && onWaResult[0]?.exists && onWaResult[0]?.jid) {
        targetJid = onWaResult[0].jid;
      }
    } catch (e) {}
  }

  return { targetJid, cleanDigits };
}

// Envio de mensagem de texto real via Baileys
export async function sendWhatsAppRealMessage(targetInput, messageText) {
  if (!targetInput || !messageText) return { success: false, error: "Destinatário ou mensagem vazia." };

  try {
    if (!sock || sessionState.status !== "CONNECTED") {
      return { success: false, error: "WhatsApp não está conectado. Escaneie o QR Code primeiro." };
    }

    const { targetJid, cleanDigits } = await resolveTargetJid(targetInput);

    console.log(`🚀 [Baileys] Enviando mensagem REAL para ${targetJid}: "${messageText}"`);
    const sentMsg = await sock.sendMessage(targetJid, { text: messageText });

    const newMsg = {
      id: sentMsg?.key?.id || `out_${Date.now()}`,
      jid: targetJid,
      phone: cleanDigits || targetJid,
      contactName: "Lead",
      direction: "OUTBOUND",
      type: "TEXT",
      content: messageText,
      timestamp: new Date().toISOString(),
      status: "SENT"
    };

    if (!messagesStore.some(m => m.id === newMsg.id)) {
      messagesStore.push(newMsg);
    }

    const chatKey = cleanDigits || targetJid;
    const existing = chatsStore.get(chatKey) || {};
    chatsStore.set(chatKey, {
      jid: targetJid,
      phone: chatKey,
      name: existing.name || `+${chatKey}`,
      avatar: existing.avatar || null,
      lastMessage: messageText,
      timestamp: newMsg.timestamp,
      unreadCount: 0
    });

    return { success: true, messageId: newMsg.id, status: "SENT", jid: targetJid };
  } catch (err) {
    console.error(`❌ Erro ao enviar mensagem Baileys para ${targetInput}:`, err);
    return { success: false, error: err.message };
  }
}

// Envio de ÁUDIO PTT (Nota de Voz Nativa) via Baileys
export async function sendWhatsAppAudioMessage(targetInput, audioBase64) {
  if (!targetInput || !audioBase64) return { success: false, error: "Destinatário ou áudio vazio." };

  try {
    if (!sock || sessionState.status !== "CONNECTED") {
      return { success: false, error: "WhatsApp não está conectado." };
    }

    const { targetJid, cleanDigits } = await resolveTargetJid(targetInput);
    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
    const audioBuffer = Buffer.from(cleanBase64, "base64");

    console.log(`🎙️ [Baileys] Enviando Áudio PTT REAL para ${targetJid} (${audioBuffer.length} bytes)`);

    const sentMsg = await sock.sendMessage(targetJid, {
      audio: audioBuffer,
      mimetype: "audio/mp4",
      ptt: true
    });

    const newMsg = {
      id: sentMsg?.key?.id || `out_audio_${Date.now()}`,
      jid: targetJid,
      phone: cleanDigits || targetJid,
      contactName: "Lead",
      direction: "OUTBOUND",
      type: "AUDIO",
      content: "🎙️ Mensagem de Áudio",
      mediaUrl: `data:audio/mp4;base64,${cleanBase64}`,
      timestamp: new Date().toISOString(),
      status: "SENT"
    };

    messagesStore.push(newMsg);

    const chatKey = cleanDigits || targetJid;
    const existing = chatsStore.get(chatKey) || {};
    chatsStore.set(chatKey, {
      jid: targetJid,
      phone: chatKey,
      name: existing.name || `+${chatKey}`,
      avatar: existing.avatar || null,
      lastMessage: "🎙️ Mensagem de Áudio",
      timestamp: newMsg.timestamp,
      unreadCount: 0
    });

    return { success: true, messageId: newMsg.id, status: "SENT", jid: targetJid };
  } catch (err) {
    console.error(`❌ Erro ao enviar áudio Baileys para ${targetInput}:`, err);
    return { success: false, error: err.message };
  }
}

// Envio de MÍDIA (Foto, Documento/PDF, Vídeo) via Baileys
export async function sendWhatsAppMediaMessage(targetInput, { mediaBase64, mediaType = "image", mimeType = "image/jpeg", fileName = "", caption = "" }) {
  if (!targetInput || !mediaBase64) return { success: false, error: "Destinatário ou mídia vazia." };

  try {
    if (!sock || sessionState.status !== "CONNECTED") {
      return { success: false, error: "WhatsApp não está conectado." };
    }

    const { targetJid, cleanDigits } = await resolveTargetJid(targetInput);
    const cleanBase64 = mediaBase64.replace(/^data:[^;]+;base64,/, "");
    const mediaBuffer = Buffer.from(cleanBase64, "base64");

    let messagePayload = {};
    let displayContent = "";

    if (mediaType === "image") {
      messagePayload = { image: mediaBuffer, caption: caption || undefined };
      displayContent = caption ? `📷 ${caption}` : "📷 Foto";
    } else if (mediaType === "document") {
      messagePayload = { 
        document: mediaBuffer, 
        mimetype: mimeType || "application/pdf", 
        fileName: fileName || "documento.pdf",
        caption: caption || undefined
      };
      displayContent = `📄 ${fileName || "Documento"}`;
    } else if (mediaType === "video") {
      messagePayload = { video: mediaBuffer, caption: caption || undefined };
      displayContent = caption ? `🎥 ${caption}` : "🎥 Vídeo";
    }

    console.log(`📎 [Baileys] Enviando Mídia REAL (${mediaType}) para ${targetJid}`);
    const sentMsg = await sock.sendMessage(targetJid, messagePayload);

    const newMsg = {
      id: sentMsg?.key?.id || `out_media_${Date.now()}`,
      jid: targetJid,
      phone: cleanDigits || targetJid,
      contactName: "Lead",
      direction: "OUTBOUND",
      type: mediaType.toUpperCase(),
      content: displayContent,
      mediaUrl: `data:${mimeType};base64,${cleanBase64}`,
      fileName: fileName,
      timestamp: new Date().toISOString(),
      status: "SENT"
    };

    messagesStore.push(newMsg);

    const chatKey = cleanDigits || targetJid;
    const existing = chatsStore.get(chatKey) || {};
    chatsStore.set(chatKey, {
      jid: targetJid,
      phone: chatKey,
      name: existing.name || `+${chatKey}`,
      avatar: existing.avatar || null,
      lastMessage: displayContent,
      timestamp: newMsg.timestamp,
      unreadCount: 0
    });

    return { success: true, messageId: newMsg.id, status: "SENT", jid: targetJid };
  } catch (err) {
    console.error(`❌ Erro ao enviar mídia Baileys para ${targetInput}:`, err);
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
  sessionState.avatar = null;
  currentQrCodeDataUrl = null;
  chatsStore.clear();
  messagesStore = [];
  
  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (e) {}

  return { success: true };
}
