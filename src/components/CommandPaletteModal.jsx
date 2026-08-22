import React, { useState, useEffect } from "react";
import { Search, Zap, Flame, Building2, Kanban, Briefcase, Settings, X, ChevronRight } from "lucide-react";

export default function CommandPaletteModal({ isOpen, onClose, companies = [], onNavigate, onSelectCompany }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCompanies = companies.filter(c => {
    if (!query) return true;
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.city || "").toLowerCase().includes(q) || (c.niche || c.category || "").toLowerCase().includes(q);
  }).slice(0, 5);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(28, 25, 23, 0.45)",
      backdropFilter: "blur(8px)",
      zIndex: 2000,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "12vh"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "620px",
        padding: 0,
        overflow: "hidden",
        background: "#ffffff",
        border: "1px solid #e8e6e0",
        boxShadow: "0 20px 40px rgba(28, 25, 23, 0.15)"
      }}>
        {/* Search Bar */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e8e6e0", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Search size={18} color="#ff6200" />
          <input 
            className="glass-input"
            autoFocus
            placeholder="Digite para buscar empresas, conversas, tarefas ou navegação... (Esc para fechar)"
            style={{ width: "100%", border: "none", background: "transparent", fontSize: "0.95rem", boxShadow: "none" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "0.5rem" }}>
          
          {/* Quick Actions */}
          <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.72rem", color: "#78716c", fontWeight: "800", textTransform: "uppercase" }}>
            Navegação Rápida
          </div>

          <div 
            onClick={() => { onNavigate("prospect_now"); onClose(); }}
            style={{ padding: "0.65rem 0.85rem", borderRadius: "6px", display: "flex", alignItems: "center", justifyBetween: "space-between", cursor: "pointer", fontSize: "0.85rem", color: "#1c1917" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Zap size={16} color="#ff6200" />
              <span>Prospectar Agora (Smart Queue)</span>
            </div>
            <ChevronRight size={14} color="#78716c" />
          </div>

          <div 
            onClick={() => { onNavigate("whatsapp"); onClose(); }}
            style={{ padding: "0.65rem 0.85rem", borderRadius: "6px", display: "flex", alignItems: "center", justifyBetween: "space-between", cursor: "pointer", fontSize: "0.85rem", color: "#1c1917" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Zap size={16} color="#16a34a" />
              <span>WhatsApp Inbox (Atendimento)</span>
            </div>
            <ChevronRight size={14} color="#78716c" />
          </div>

          <div 
            onClick={() => { onNavigate("radar"); onClose(); }}
            style={{ padding: "0.65rem 0.85rem", borderRadius: "6px", display: "flex", alignItems: "center", justifyBetween: "space-between", cursor: "pointer", fontSize: "0.85rem", color: "#1c1917" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Flame size={16} color="#ff6200" />
              <span>Radar de Oportunidades</span>
            </div>
            <ChevronRight size={14} color="#78716c" />
          </div>

          {/* Companies Results */}
          {filteredCompanies.length > 0 && (
            <>
              <div style={{ padding: "0.75rem 0.75rem 0.35rem 0.75rem", fontSize: "0.72rem", color: "#78716c", fontWeight: "800", textTransform: "uppercase" }}>
                Empresas & Leads Encontrados
              </div>

              {filteredCompanies.map(c => (
                <div 
                  key={c.id}
                  onClick={() => { onSelectCompany(c); onClose(); }}
                  style={{ padding: "0.65rem 0.85rem", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontSize: "0.85rem", color: "#1c1917" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Building2 size={16} color="#0284c7" />
                    <strong>{c.name}</strong>
                    <span style={{ fontSize: "0.75rem", color: "#78716c" }}>({c.city})</span>
                  </div>
                  <span className="badge" style={{ background: "#fff7ed", color: "#ea580c", fontSize: "0.68rem" }}>
                    Score {c.scores?.finalScore || 90}
                  </span>
                </div>
              ))}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
