import React, { useState } from "react";
import { MessageCircle, CheckCircle2, AlertCircle, Save, Layers, Plus, FileText } from "lucide-react";

export default function WhatsAppSettingsView({ showToast }) {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("growthhunter_webhook_verify_token_2026");

  const [isConnected, setIsConnected] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (phoneNumberId && accessToken) {
      setIsConnected(true);
      if (showToast) showToast("✅ Integração com WhatsApp Business conectada!", "success");
    } else {
      setIsConnected(false);
      if (showToast) showToast("⚠️ Insira as credenciais do WhatsApp Business.", "info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* HEADER BANNER */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #ffffff 100%)",
        border: "1px solid #fed7aa",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <MessageCircle size={26} color="#ff6200" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
              📱 CONEXÃO WHATSAPP BUSINESS PLATFORM (API OFICIAL)
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
            Configure a API Oficial da Meta para receber e disparar mensagens com atendimento em tempo real dentro do CRM.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="badge" style={{
            background: isConnected ? "#f0fdf4" : "#fef2f2",
            color: isConnected ? "#16a34a" : "#dc2626",
            border: isConnected ? "1px solid #bbf7d0" : "1px solid #fecaca",
            fontSize: "0.85rem",
            fontWeight: "800",
            padding: "0.4rem 0.8rem"
          }}>
            {isConnected ? "● CONNECTED" : "● NOT CONFIGURED"}
          </span>
        </div>
      </div>

      {/* FORM CONFIG */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1.25rem" }}>
          Credenciais do Aplicativo Meta Developers:
        </h3>

        <form onSubmit={handleSaveConfig} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          
          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              WHATSAPP_PHONE_NUMBER_ID:
            </label>
            <input 
              className="glass-input"
              type="text"
              placeholder="Ex: 1092837465019..."
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              WHATSAPP_BUSINESS_ACCOUNT_ID:
            </label>
            <input 
              className="glass-input"
              type="text"
              placeholder="Ex: 9876543210123..."
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={businessAccountId}
              onChange={(e) => setBusinessAccountId(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              WHATSAPP_ACCESS_TOKEN (Permanent Token):
            </label>
            <input 
              className="glass-input"
              type="password"
              placeholder="EAAG..."
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
          </div>

          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#1c1917", display: "block", marginBottom: "4px" }}>
              URL de Webhook Oficial Meta:
            </span>
            <code style={{ fontSize: "0.8rem", color: "#ff6200", background: "#fff7ed", padding: "0.3rem 0.6rem", borderRadius: "4px", display: "block" }}>
              http://localhost:3001/api/webhooks/whatsapp
            </code>
            <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block", marginTop: "4px" }}>
              Verify Token: <strong>{verifyToken}</strong>
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>Salvar Configuração do WhatsApp</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
