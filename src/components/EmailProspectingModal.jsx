import React, { useState, useEffect } from "react";
import { X, Mail, Copy, Check, Send, Sparkles } from "lucide-react";

export default function EmailProspectingModal({ isOpen, lead, onClose }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  useEffect(() => {
    if (lead && lead.aiAnalysis?.emailPitch) {
      setSubject(lead.aiAnalysis.emailPitch.subject || `Proposta comercial para ${lead.name}`);
      setBody(lead.aiAnalysis.emailPitch.body || "");
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const mailtoUrl = `mailto:${lead.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(28, 25, 23, 0.45)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "650px",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        background: "#ffffff",
        border: "1px solid #e8e6e0"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ background: "#f0f9ff", padding: "0.5rem", borderRadius: "8px", border: "1px solid #bae6fd" }}>
              <Mail size={20} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "900", color: "#1c1917", margin: 0 }}>
                Gerador de E-mail Frio B2B — {lead.name}
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#78716c" }}>
                Script de e-mail estruturado de alta conversão
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>

        {/* Subject */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <label style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "700" }}>Assunto do E-mail:</label>
            <button className="btn-secondary" onClick={handleCopySubject} style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem" }}>
              {copiedSubject ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              <span>{copiedSubject ? "Copiado!" : "Copiar Assunto"}</span>
            </button>
          </div>
          <input 
            className="glass-input" 
            type="text" 
            style={{ width: "100%", fontSize: "0.88rem" }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Body */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <label style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "700" }}>Corpo da Mensagem:</label>
            <button className="btn-secondary" onClick={handleCopyBody} style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem" }}>
              {copiedBody ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              <span>{copiedBody ? "Copiado!" : "Copiar Corpo"}</span>
            </button>
          </div>
          <textarea 
            className="glass-input" 
            rows={8}
            style={{ width: "100%", fontSize: "0.85rem", lineHeight: "1.45" }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar
          </button>

          <a href={mailtoUrl} className="btn-primary" style={{ textDecoration: "none" }}>
            <Send size={16} />
            <span>Abrir Gerenciador de E-mail</span>
          </a>
        </div>

      </div>
    </div>
  );
}
