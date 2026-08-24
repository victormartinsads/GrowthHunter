import React, { useState } from "react";
import { 
  Search, MessageSquare, ExternalLink, Sparkles, Copy, 
  Check, UserCheck, ArrowUpRight, Plus, Filter, Users, Phone, Globe, 
  Send, Layers, ShieldAlert, CheckCircle2, BookmarkPlus
} from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon";

export default function InstagramProspectingView({
  onImportLeadToCrm,
  onOpenDispatchModal,
  showToast
}) {
  const [niche, setNiche] = useState("Harmonização Facial");
  const [location, setLocation] = useState("Campinas, SP");
  const [maxResults, setMaxResults] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [filterType, setFilterType] = useState("ALL"); // "ALL" | "NO_WEBSITE" | "HAS_PHONE"
  const [copiedId, setCopiedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [importedIds, setImportedIds] = useState(new Set());

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!niche.trim() || !location.trim()) {
      showToast?.("Informe o nicho e a cidade/estado para buscar.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const apifyToken = localStorage.getItem("APIFY_API_TOKEN") || "";
      const res = await fetch("http://localhost:3001/api/search-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          location: location.trim(),
          maxResults: Number(maxResults) || 20,
          apifyToken
        })
      });

      if (!res.ok) throw new Error("Falha na resposta do servidor");
      const data = await res.json();

      if (data.success && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        setSelectedIds(new Set());
        showToast?.(`📸 ${data.profiles.length} perfis reais encontrados no Instagram!`, "success");
      } else {
        throw new Error(data.error || "Nenhum perfil encontrado");
      }
    } catch (err) {
      console.error("Erro na busca Instagram:", err);
      showToast?.("Erro ao buscar perfis no Instagram. Verifique se o backend está ativo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyScript = (profile) => {
    navigator.clipboard.writeText(profile.directScript);
    setCopiedId(profile.id);
    showToast?.(`Script copiado para @${profile.rawUsername}!`, "success", 2000);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleImportSingle = (profile) => {
    if (importedIds.has(profile.id)) return;

    const newLead = {
      name: profile.fullName || profile.username,
      niche: profile.niche,
      city: profile.city,
      phone: profile.phone || "",
      instagram: profile.username,
      website: profile.externalUrl || "",
      source: "Instagram Direct Radar",
      pipeline_stage: "NEW",
      status: "Novo Lead",
      notes: `📸 Perfil do Instagram: ${profile.username} • Bio: ${profile.biography.slice(0, 150)}...`,
      aiAnalysis: {
        opening_message: profile.directScript,
        urgency: "HIGH",
        key_talking_points: [
          "Prospectado via Instagram Direct",
          profile.hasLinktree ? "Utiliza Linktree na bio (oportunidade de site próprio)" : "Não possui site próprio estruturado",
          "Abordagem consultiva pelo direct"
        ]
      }
    };

    if (onImportLeadToCrm) {
      onImportLeadToCrm(newLead);
      setImportedIds(prev => new Set([...prev, profile.id]));
      showToast?.(`@${profile.rawUsername} importado para o CRM com sucesso!`, "success");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProfiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProfiles.map(p => p.id)));
    }
  };

  const handleBatchImport = () => {
    const selectedProfiles = profiles.filter(p => selectedIds.has(p.id));
    if (selectedProfiles.length === 0) return;

    selectedProfiles.forEach(p => handleImportSingle(p));
    showToast?.(`📥 ${selectedProfiles.length} perfis importados para o CRM!`, "success");
  };

  const filteredProfiles = profiles.filter(p => {
    if (filterType === "NO_WEBSITE" && p.hasRealWebsite) return false;
    if (filterType === "HAS_PHONE" && !p.phone) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* HEADER BANNER */}
      <div className="glass-card" style={{
        padding: "1.5rem",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
        color: "#ffffff",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
        boxShadow: "0 10px 25px -5px rgba(219, 39, 119, 0.3)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "800", letterSpacing: "0.05em" }}>
              INSTAGRAM DIRECT HUNTER
            </span>
            <span style={{ fontSize: "0.75rem", color: "#fce7f3" }}>Prospecção 1-Toque no Direct</span>
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: 0 }}>
            Radar de Perfis & Prospecção via Direct
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#fdf2f8", margin: "0.25rem 0 0 0", maxWidth: "650px", lineHeight: "1.4" }}>
            Encontre perfis reais de empresas e profissionais no Instagram pelo nicho e cidade, filtre quem não tem site próprio e envie DMs altamente personalizadas em 1 clique.
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: "900" }}>
            {profiles.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#fdf2f8" }}>
            Perfis Carregados
          </span>
        </div>
      </div>

      {/* SEARCH CONTROLS */}
      <form onSubmit={handleSearch} className="glass-card" style={{
        padding: "1.25rem",
        background: "#ffffff",
        border: "1px solid #e8e6e0",
        display: "grid",
        gridTemplateColumns: "1.5fr 1.2fr 120px auto",
        gap: "0.75rem",
        alignItems: "end"
      }}>
        <div>
          <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "0.3rem" }}>
            🎯 Nicho / Profissão / Palavra-Chave:
          </label>
          <input
            type="text"
            className="glass-input"
            style={{ width: "100%", fontSize: "0.85rem" }}
            placeholder="Ex: Harmonização Facial, Dentista, Nutricionista..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "0.3rem" }}>
            📍 Cidade / Região:
          </label>
          <input
            type="text"
            className="glass-input"
            style={{ width: "100%", fontSize: "0.85rem" }}
            placeholder="Ex: Campinas, SP ou Curitiba..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "0.3rem" }}>
            Qtd. Perfis:
          </label>
          <select
            className="glass-select"
            style={{ width: "100%", fontSize: "0.85rem" }}
            value={maxResults}
            onChange={(e) => setMaxResults(e.target.value)}
          >
            <option value={10}>10 perfis</option>
            <option value={20}>20 perfis</option>
            <option value={40}>40 perfis</option>
            <option value={80}>80 perfis</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
          style={{
            background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
            border: "none",
            padding: "0.65rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.85rem",
            fontWeight: "800",
            cursor: isLoading ? "wait" : "pointer"
          }}
        >
          <Search size={16} />
          <span>{isLoading ? "Buscando..." : "Buscar Perfis"}</span>
        </button>
      </form>

      {/* FILTER BAR & BATCH ACTIONS */}
      {profiles.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          padding: "0.5rem 0"
        }}>
          
          {/* Quick Filters */}
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: filterType === "ALL" ? "800" : "600",
                background: filterType === "ALL" ? "#0f172a" : "#ffffff",
                color: filterType === "ALL" ? "#ffffff" : "#475569",
                border: "1px solid #e2e8f0",
                cursor: "pointer"
              }}
            >
              Todos ({profiles.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType("NO_WEBSITE")}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: filterType === "NO_WEBSITE" ? "800" : "600",
                background: filterType === "NO_WEBSITE" ? "#fdf2f8" : "#ffffff",
                color: filterType === "NO_WEBSITE" ? "#db2777" : "#475569",
                border: filterType === "NO_WEBSITE" ? "1px solid #fbcfe8" : "1px solid #e2e8f0",
                cursor: "pointer"
              }}
            >
              🚨 Sem Site Próprio / Usa Linktree
            </button>

            <button
              type="button"
              onClick={() => setFilterType("HAS_PHONE")}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: filterType === "HAS_PHONE" ? "800" : "600",
                background: filterType === "HAS_PHONE" ? "#f0fdf4" : "#ffffff",
                color: filterType === "HAS_PHONE" ? "#16a34a" : "#475569",
                border: filterType === "HAS_PHONE" ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                cursor: "pointer"
              }}
            >
              📞 Com WhatsApp na Bio
            </button>
          </div>

          {/* Batch Import Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={handleSelectAll}
              style={{ fontSize: "0.75rem", background: "none", border: "none", color: "#64748b", cursor: "pointer", textDecoration: "underline" }}
            >
              {selectedIds.size === filteredProfiles.length ? "Desmarcar Todos" : "Selecionar Todos"}
            </button>

            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleBatchImport}
                className="btn-primary"
                style={{
                  fontSize: "0.78rem",
                  padding: "0.4rem 0.9rem",
                  background: "#16a34a",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <BookmarkPlus size={14} />
                <span>Importar {selectedIds.size} selecionados p/ CRM</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* PROFILES GRID */}
      {profiles.length === 0 ? (
        <div className="glass-card" style={{
          padding: "3.5rem 1.5rem",
          textAlign: "center",
          background: "#ffffff",
          border: "1px solid #e8e6e0"
        }}>
          <div style={{ width: "64px", height: "64px", background: "#fdf2f8", color: "#db2777", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
            <InstagramIcon size={36} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", margin: 0 }}>
            Nenhum perfil buscado ainda
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.4rem 0 1.5rem 0", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
            Digite o nicho desejado (ex: <strong>Estética</strong> ou <strong>Advocacia</strong>) e a cidade para extrair perfis com seguidores, bio e botão de Direct direto!
          </p>
          <button
            type="button"
            onClick={handleSearch}
            className="btn-primary"
            style={{ background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)", border: "none" }}
          >
            Fazer Primeira Busca no Instagram
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "1rem"
        }}>
          {filteredProfiles.map((profile) => {
            const isSelected = selectedIds.has(profile.id);
            const isImported = importedIds.has(profile.id);

            return (
              <div
                key={profile.id}
                className="glass-card"
                style={{
                  background: "#ffffff",
                  border: isSelected ? "2px solid #db2777" : "1px solid #e8e6e0",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  position: "relative"
                }}
              >
                {/* Card Header: Avatar + Username + Checkbox */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(profile.id)}
                    style={{ marginTop: "0.25rem", cursor: "pointer", width: "16px", height: "16px" }}
                  />

                  {/* Avatar */}
                  <img
                    src={profile.profilePicUrl}
                    alt={profile.rawUsername}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.fullName) + "&background=db2777&color=fff"; }}
                    style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fdf2f8" }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <strong style={{ fontSize: "0.92rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {profile.fullName}
                      </strong>
                    </div>

                    <a
                      href={profile.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "#db2777", fontWeight: "700", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
                    >
                      <span>{profile.username}</span>
                      <ArrowUpRight size={11} />
                    </a>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                      <span>👥 {profile.followersCount.toLocaleString('pt-BR')} seguidores</span>
                      <span>•</span>
                      <span>📍 {profile.city}</span>
                    </div>
                  </div>
                </div>

                {/* Bio text snippet */}
                <div style={{
                  fontSize: "0.78rem",
                  color: "#334155",
                  background: "#fafaf9",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #f1f5f9",
                  lineHeight: "1.4",
                  maxHeight: "68px",
                  overflowY: "auto"
                }}>
                  {profile.biography || "Sem descrição disponível na bio."}
                </div>

                {/* Status Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  {profile.hasLinktree ? (
                    <span className="badge" style={{ background: "#fdf2f8", color: "#db2777", border: "1px solid #fbcfe8", fontSize: "0.68rem" }}>
                      🔗 Usa Linktree na Bio
                    </span>
                  ) : profile.hasRealWebsite ? (
                    <span className="badge" style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", fontSize: "0.68rem" }}>
                      🌐 Possui Website Próprio
                    </span>
                  ) : (
                    <span className="badge" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: "0.68rem" }}>
                      🚨 Sem Site (Alvo Quente)
                    </span>
                  )}

                  {profile.phone && (
                    <span className="badge" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontSize: "0.68rem" }}>
                      📞 WhatsApp Identificado
                    </span>
                  )}
                </div>

                {/* DM Script Box */}
                <div style={{
                  background: "#fdf2f8",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #fbcfe8",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#9d174d", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Sparkles size={12} />
                      <span>Script Direct Recomendado:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyScript(profile)}
                      style={{
                        fontSize: "0.68rem",
                        padding: "0.15rem 0.45rem",
                        background: "#ffffff",
                        border: "1px solid #fbcfe8",
                        borderRadius: "4px",
                        color: "#db2777",
                        cursor: "pointer",
                        fontWeight: "700"
                      }}
                    >
                      {copiedId === profile.id ? "Copiado!" : "Copiar"}
                    </button>
                  </div>

                  <p style={{ fontSize: "0.76rem", color: "#831843", margin: 0, lineHeight: "1.35" }}>
                    "{profile.directScript}"
                  </p>
                </div>

                {/* Actions Footer */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr",
                  gap: "0.5rem",
                  marginTop: "auto",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid #f5f5f4"
                }}>
                  {/* Open Direct Button */}
                  <a
                    href={profile.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)",
                      border: "none",
                      fontSize: "0.78rem",
                      padding: "0.45rem 0.6rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.3rem",
                      textDecoration: "none",
                      color: "#ffffff"
                    }}
                  >
                    <MessageSquare size={13} />
                    <span>Abrir Direct</span>
                    <ArrowUpRight size={11} />
                  </a>

                  {/* Import to CRM Button */}
                  <button
                    type="button"
                    onClick={() => handleImportSingle(profile)}
                    disabled={isImported}
                    className="btn-secondary"
                    style={{
                      fontSize: "0.78rem",
                      padding: "0.45rem 0.6rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.3rem",
                      background: isImported ? "#f1f5f9" : "#ffffff",
                      color: isImported ? "#94a3b8" : "#0f172a",
                      cursor: isImported ? "default" : "pointer"
                    }}
                  >
                    {isImported ? <Check size={13} color="#16a34a" /> : <Plus size={13} />}
                    <span>{isImported ? "No CRM" : "Importar CRM"}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
