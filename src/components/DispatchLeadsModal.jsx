import React, { useState, useEffect } from "react";
import { X, Send, Copy, Check, MessageSquare, Phone, User, Sparkles, Building, Layers } from "lucide-react";
import { generateSalespersonDispatchMessage } from "../utils/salesDispatchEngine";
import { buildWhatsappUrl } from "../utils/helpers";

export default function DispatchLeadsModal({ 
  isOpen, 
  onClose, 
  selectedCompanies = [] 
}) {
  const [salespersonName, setSalespersonName] = useState(() => {
    return localStorage.getItem("SALESPERSON_NAME") || "Vendedora";
  });
  
  const [salespersonPhone, setSalespersonPhone] = useState(() => {
    return localStorage.getItem("SALESPERSON_PHONE") || "";
  });

  const [copied, setCopied] = useState(false);

  // Formata o texto em tempo real conforme muda o nome da vendedora
  const formattedMessage = generateSalespersonDispatchMessage(selectedCompanies, salespersonName);

  useEffect(() => {
    if (salespersonName) localStorage.setItem("SALESPERSON_NAME", salespersonName);
    if (salespersonPhone) localStorage.setItem("SALESPERSON_PHONE", salespersonPhone);
  }, [salespersonName, salespersonPhone]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToSalespersonWhatsapp = () => {
    let cleanPhone = salespersonPhone.replace(/\D/g, "");
    if (cleanPhone && !cleanPhone.startsWith("55") && cleanPhone.length >= 10) {
      cleanPhone = `55${cleanPhone}`;
    }

    if (!cleanPhone) {
      // Se não tiver colocado o número da vendedora, abre o WhatsApp Web com o texto pronto
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;
      window.open(url, "_blank");
      return;
    }

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(formattedMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(28, 25, 23, 0.55)",
      backdropFilter: "blur(8px)",
      zIndex: 1100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "750px",
        padding: "1.75rem",
        maxHeight: "92vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        background: "#ffffff",
        border: "1px solid #e8e6e0",
        boxShadow: "0 24px 48px -12px rgba(0,0,0,0.18)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{ background: "#ecfdf5", padding: "0.55rem", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
              <Send size={22} color="#16a34a" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#1c1917", margin: 0 }}>
                Enviar Lote de Leads para Vendedora
              </h3>
              <span style={{ fontSize: "0.78rem", color: "#57534e" }}>
                Exporta os dados, diagnósticos de site e links de WhatsApp direto para o celular da sua equipe
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "0.85rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge" style={{ background: "#16a34a", color: "#ffffff", fontWeight: "800", fontSize: "0.75rem" }}>
              {selectedCompanies.length} LEADS SELECIONADOS
            </span>
            <span style={{ fontSize: "0.82rem", color: "#166534", fontWeight: "600" }}>
              Prontos com link de WhatsApp de 1 toque para cada empresa
            </span>
          </div>
        </div>

        {/* Salesperson Settings (Name & Phone) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#1c1917", display: "block", marginBottom: "0.3rem" }}>
              👤 Nome da Vendedora / SDR:
            </label>
            <input 
              type="text"
              className="glass-input"
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={salespersonName}
              onChange={(e) => setSalespersonName(e.target.value)}
              placeholder="Ex: Amanda Vendas"
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#1c1917", display: "block", marginBottom: "0.3rem" }}>
              📱 WhatsApp da Vendedora (com DDD):
            </label>
            <input 
              type="text"
              className="glass-input"
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={salespersonPhone}
              onChange={(e) => setSalespersonPhone(e.target.value)}
              placeholder="Ex: 11999998888 (Opcional)"
            />
          </div>
        </div>

        {/* Message Preview Box */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#1c1917" }}>
              📄 Prévia da Mensagem Formatada para WhatsApp:
            </label>
            <span style={{ fontSize: "0.72rem", color: "#78716c" }}>
              Inclui diagnóstico de site, e-mail, telefone e script
            </span>
          </div>

          <textarea 
            readOnly
            value={formattedMessage}
            rows={12}
            style={{
              width: "100%",
              background: "#faf9f6",
              border: "1px solid #e8e6e0",
              borderRadius: "8px",
              padding: "0.85rem",
              fontSize: "0.82rem",
              fontFamily: "monospace",
              color: "#1c1917",
              lineHeight: "1.5",
              resize: "vertical"
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.65rem", flexWrap: "wrap", borderTop: "1px solid #f5f5f4", paddingTop: "0.75rem" }}>
          
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopy}
            style={{ fontSize: "0.85rem", padding: "0.55rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
            <span>{copied ? "Mensagem Copiada!" : "Copiar Texto Formatado"}</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSendToSalespersonWhatsapp}
            style={{
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              border: "none",
              fontSize: "0.88rem",
              padding: "0.55rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)"
            }}
          >
            <MessageSquare size={16} color="#ffffff" />
            <span>Abrir no WhatsApp da Vendedora</span>
          </button>

        </div>

      </div>
    </div>
  );
}
