import React, { useState } from "react";
import { 
  Search, Globe, AtSign, ShieldAlert, CheckCircle, ExternalLink, 
  RefreshCw, Zap, Sparkles, X, Eye, Mail, Building2, MapPin, Phone, Copy, Check, Share2
} from "lucide-react";
import { fetchCnpjDataReal, buildRealSocialLinks, formatCnpj } from "../utils/realEnrichment";
import { buildWhatsappUrl, buildInstagramUrl, buildWebsiteUrl } from "../utils/helpers";

export default function EnrichmentModal({ 
  isOpen, 
  onClose, 
  loading, 
  progress, 
  enrichedResult, 
  onApplyEnriched 
}) {
  const [cnpjInput, setCnpjInput] = useState("");
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState("");
  const [cnpjData, setCnpjData] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const handleCnpjSearch = async (e) => {
    e.preventDefault();
    if (!cnpjInput) return;
    setCnpjLoading(true);
    setCnpjError("");
    setCnpjData(null);

    try {
      const data = await fetchCnpjDataReal(cnpjInput);
      const socialLinks = buildRealSocialLinks(data);
      setCnpjData({ ...data, socialLinks });
    } catch (err) {
      setCnpjError(err.message || "Erro ao consultar CNPJ.");
    } finally {
      setCnpjLoading(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const activeResult = cnpjData || enrichedResult;
  const socialLinks = activeResult ? buildRealSocialLinks(activeResult) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-card" 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "640px",
          padding: "1.75rem",
          borderRadius: "var(--radius-lg)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer"
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Search color="#10b981" size={24} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>
              Caçador & Rastreio Real de Empresas e Redes Sociais
            </h2>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Encontre e-mails, telefones, CNPJ oficial, site e redes sociais da empresa em tempo real.
          </p>
        </div>

        {/* CNPJ REAL API SEARCH BAR */}
        <form onSubmit={handleCnpjSearch} style={{
          background: "rgba(15, 23, 42, 0.7)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1rem",
          marginBottom: "1.25rem"
        }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
            ⚡ <strong>Consulta Oficial por CNPJ na Receita Federal (BrasilAPI / MinhaReceita):</strong>
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Digite o CNPJ da empresa (ex: 00.000.000/0001-00)..."
              value={cnpjInput}
              onChange={e => setCnpjInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" disabled={cnpjLoading} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
              {cnpjLoading ? <RefreshCw size={16} className="spin" /> : <Building2 size={16} />}
              <span>{cnpjLoading ? "Buscando..." : "Consultar CNPJ"}</span>
            </button>
          </div>
          {cnpjError && (
            <p style={{ fontSize: "0.78rem", color: "#f87171", marginTop: "6px" }}>
              ⚠️ {cnpjError}
            </p>
          )}
        </form>

        {/* SCANNER LOADING */}
        {loading || cnpjLoading ? (
          <div style={{
            padding: "2.5rem 1.5rem",
            textAlign: "center",
            background: "rgba(15, 23, 42, 0.6)",
            borderRadius: "var(--radius-md)",
            border: "1px border-color",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <RefreshCw size={32} color="#10b981" />
            </div>

            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.4rem" }}>
                Caçando E-mails, CNPJ e Redes Sociais...
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: "600" }}>
                {progress?.current ? `Consultando item ${progress.current} de ${progress.total}` : "Consultando Receita Federal e rastreando web..."}
              </p>
            </div>
          </div>
        ) : activeResult ? (
          /* RESULT DISPLAY */
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            
            {/* Header Result Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#f8fafc" }}>
                    {activeResult.name}
                  </h3>
                  {activeResult.razaoSocial && activeResult.razaoSocial !== activeResult.name && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>
                      Razão Social: {activeResult.razaoSocial}
                    </span>
                  )}
                </div>

                {activeResult.cnpj && (
                  <span className="badge badge-region" style={{ fontSize: "0.8rem" }}>
                    CNPJ: {activeResult.cnpj}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <span className="badge badge-niche">{activeResult.niche}</span>
                <span className="badge badge-region">
                  <MapPin size={11} />
                  {activeResult.city} {activeResult.state ? `- ${activeResult.state}` : ''}
                </span>
              </div>
            </div>

            {/* Enriched Details Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              
              {/* Official E-mail */}
              <div style={{
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-color)",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Mail size={18} color="#06b6d4" />
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>E-mail Oficial de Contato:</span>
                    <strong style={{ fontSize: "0.9rem", color: "#22d3ee" }}>{activeResult.email || "Não informado no cadastro público"}</strong>
                  </div>
                </div>

                {activeResult.email && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleCopyText(activeResult.email)}
                    style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                  >
                    {copiedEmail ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copiedEmail ? "Copiado!" : "Copiar E-mail"}</span>
                  </button>
                )}
              </div>

              {/* Official Phone */}
              {activeResult.phone && buildWhatsappUrl(activeResult.phone) && (
                <div style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-color)",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Phone size={18} color="#10b981" />
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Telefone / WhatsApp:</span>
                      <strong style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{activeResult.phone}</strong>
                    </div>
                  </div>

                  <a 
                    href={buildWhatsappUrl(activeResult.phone)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                    style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                  >
                    <span>Abrir WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Website */}
              <div style={{
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-color)",
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Globe size={18} color="#3b82f6" />
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Website Encontrado:</span>
                    <strong style={{ fontSize: "0.88rem", color: "#f8fafc" }}>{activeResult.website || socialLinks?.probableWebsite || "Não informado"}</strong>
                  </div>
                </div>

                {(activeResult.website || socialLinks?.probableWebsite) && (
                  <a 
                    href={activeResult.website || socialLinks?.probableWebsite}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                  >
                    <ExternalLink size={14} />
                    <span>Visitar</span>
                  </a>
                )}
              </div>

              {/* Live Search Buttons for Social Networks */}
              <div style={{ background: "rgba(30, 41, 59, 0.5)", padding: "0.85rem", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.6rem" }}>
                  🔗 <strong>Links Diretos para Caçar Redes Sociais da Empresa:</strong>
                </span>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  {socialLinks?.instagramSearch && (
                    <a href={socialLinks.instagramSearch} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.75rem", padding: "0.4rem" }}>
                      <AtSign size={13} color="#c084fc" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {socialLinks?.facebookSearch && (
                    <a href={socialLinks.facebookSearch} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.75rem", padding: "0.4rem" }}>
                      <Share2 size={13} color="#3b82f6" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {socialLinks?.linkedinSearch && (
                    <a href={socialLinks.linkedinSearch} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.75rem", padding: "0.4rem" }}>
                      <Globe size={13} color="#06b6d4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {socialLinks?.googleMaps && (
                    <a href={socialLinks.googleMaps} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.75rem", padding: "0.4rem" }}>
                      <MapPin size={13} color="#f59e0b" />
                      <span>Google Maps</span>
                    </a>
                  )}
                  {socialLinks?.metaAdsLibrary && (
                    <a href={socialLinks.metaAdsLibrary} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.75rem", padding: "0.4rem" }}>
                      <Eye size={13} color="#10b981" />
                      <span>Meta Ads Library</span>
                    </a>
                  )}
                  {socialLinks?.googleSearch && (
                    <a href={socialLinks.googleSearch} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.75rem", padding: "0.4rem" }}>
                      <Search size={13} />
                      <span>Buscar Google</span>
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Save Action */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button className="btn-secondary" onClick={onClose}>Fechar</button>
              <button className="btn-primary" onClick={() => onApplyEnriched(activeResult)}>
                <Sparkles size={16} />
                <span>Salvar E-mail & Dados no Lead</span>
              </button>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
