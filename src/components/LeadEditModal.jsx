import React, { useState, useEffect } from "react";
import { X, Save, Building2, Phone, Globe, MapPin, UserCheck, RefreshCw, AlertCircle } from "lucide-react";
import { fetchCnpjQsaPartners } from "../utils/partnerEnrichmentService";

export default function LeadEditModal({ isOpen, lead, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    phone: "",
    website: "",
    city: "",
    cnpj: "",
    partners: []
  });

  const [enriching, setEnriching] = useState(false);
  const [enrichStatus, setEnrichStatus] = useState(null);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || "",
        category: lead.niche || lead.category || "",
        phone: lead.phone || "",
        website: lead.website || "",
        city: lead.city || "",
        cnpj: lead.cnpj || "",
        partners: lead.partners || []
      });
      setEnrichStatus(null);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleEnrichCnpj = async () => {
    if (!formData.cnpj && !formData.name) return;
    setEnriching(true);
    setEnrichStatus(null);

    try {
      const enriched = await fetchCnpjQsaPartners({ cnpj: formData.cnpj, name: formData.name });
      if (enriched.partners && enriched.partners.length > 0) {
        setFormData(prev => ({
          ...prev,
          partners: enriched.partners,
          phone: prev.phone || enriched.officialPhone || "",
          city: prev.city || enriched.officialCity || ""
        }));
        setEnrichStatus(`✅ Encontrado(s) ${enriched.partners.length} sócio(s) na Receita Federal!`);
      } else {
        setEnrichStatus("⚠️ Nenhum sócio retornado para este CNPJ/Empresa.");
      }
    } catch (err) {
      setEnrichStatus("❌ Erro ao consultar Receita Federal.");
    } finally {
      setEnriching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...lead,
      name: formData.name,
      niche: formData.category,
      category: formData.category,
      phone: formData.phone,
      website: formData.website,
      city: formData.city,
      cnpj: formData.cnpj,
      partners: formData.partners
    });
    onClose();
  };

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
            <Building2 size={22} color="#ff6200" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: "900", color: "#1c1917", margin: 0 }}>
              Editar Empresa & Consultar Sócios (QSA)
            </h3>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Nome da Empresa:
              </label>
              <input 
                className="glass-input"
                type="text"
                required
                style={{ width: "100%" }}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Nicho / Categoria:
              </label>
              <input 
                className="glass-input"
                type="text"
                style={{ width: "100%" }}
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Telefone / WhatsApp:
              </label>
              <input 
                className="glass-input"
                type="text"
                style={{ width: "100%" }}
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Cidade / Estado:
              </label>
              <input 
                className="glass-input"
                type="text"
                style={{ width: "100%" }}
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              Website URL:
            </label>
            <input 
              className="glass-input"
              type="text"
              placeholder="https://..."
              style={{ width: "100%" }}
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          {/* CNPJ & QSA PARTNERS ENRICHMENT */}
          <div style={{ background: "#faf9f6", border: "1px solid #e8e6e0", padding: "1rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#ff6200", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <UserCheck size={16} />
                <span>Consulta CNPJ & Sócios na Receita Federal</span>
              </span>

              <button 
                type="button"
                className="btn-secondary"
                onClick={handleEnrichCnpj}
                disabled={enriching}
                style={{ fontSize: "0.78rem", padding: "0.35rem 0.7rem", color: "#ff6200", borderColor: "#ffedd5" }}
              >
                {enriching ? <RefreshCw size={14} className="animate-spin" /> : <UserCheck size={14} />}
                <span>{enriching ? "Consultando..." : "👔 Buscar Sócios (QSA)"}</span>
              </button>
            </div>

            <input 
              className="glass-input"
              type="text"
              placeholder="CNPJ da empresa (00.000.000/0000-00)..."
              style={{ width: "100%", fontSize: "0.82rem" }}
              value={formData.cnpj}
              onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
            />

            {enrichStatus && (
              <div style={{ fontSize: "0.8rem", fontWeight: "600", color: enrichStatus.includes("✅") ? "#16a34a" : "#dc2626" }}>
                {enrichStatus}
              </div>
            )}

            {formData.partners && formData.partners.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.25rem" }}>
                {formData.partners.map((p, idx) => (
                  <div key={idx} style={{ fontSize: "0.82rem", color: "#1c1917" }}>
                    👤 <strong>{p.name}</strong> ({p.role})
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
