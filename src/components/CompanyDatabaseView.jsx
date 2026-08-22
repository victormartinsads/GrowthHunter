import React, { useState, useMemo } from "react";
import { 
  Building2, Search, Filter, Download, Star, MapPin, Eye, Edit3, MessageCircle, Mail, Globe, 
  CheckSquare, Square, Trash2, Tag, UserCheck 
} from "lucide-react";
import { normalizeSegment } from "../utils/segmentClassifier";
import { buildWhatsappUrl, buildWebsiteUrl } from "../utils/helpers";

export default function CompanyDatabaseView({ 
  companies = [], 
  onSelectCompany, 
  onOpenEditModal, 
  onOpenEmailModal, 
  onDeleteBatch 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("TODOS");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("TODOS");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState("score");

  const niches = useMemo(() => Array.from(new Set(companies.map(c => normalizeSegment(c.niche || c.category)).filter(Boolean))), [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      if (selectedNiche !== "TODOS" && normalizeSegment(c.niche || c.category) !== selectedNiche) return false;

      const isNoWebsite = c.website_status === "missing" || !c.website;
      if (selectedStatusFilter === "NO_WEBSITE" && !isNoWebsite) return false;
      if (selectedStatusFilter === "BAD_WEBSITE" && (isNoWebsite || (c.website_score?.totalScore || 60) >= 50)) return false;
      if (selectedStatusFilter === "NO_PIXEL" && (isNoWebsite || c.tech_results?.metaPixel?.detected === "detected")) return false;
      if (selectedStatusFilter === "HOT" && c.scores?.classification !== "HOT") return false;

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(query);
        const matchCity = (c.city || "").toLowerCase().includes(query);
        const matchNiche = (c.niche || c.category || "").toLowerCase().includes(query);
        if (!matchName && !matchCity && !matchNiche) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === "name") return a.name.localeCompare(b.name);
      if (sortField === "rating") return (b.rating || 0) - (a.rating || 0);
      return (b.scores?.finalScore || 0) - (a.scores?.finalScore || 0);
    });
  }, [companies, selectedNiche, selectedStatusFilter, searchQuery, sortField]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCompanies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCompanies.map(c => c.id));
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const exportCsv = () => {
    const headers = ["ID", "Empresa", "Categoria", "Cidade", "Website", "Score", "Meta Pixel", "GA4", "Score Oportunidade", "Oferta Recomendada", "Status CRM"];
    const rows = filteredCompanies.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.niche || c.category || ''}"`,
      `"${c.city || ''}"`,
      `"${c.website || ''}"`,
      c.scores?.finalScore || 0,
      c.tech_results?.metaPixel?.detected || 'not_detected',
      c.tech_results?.ga4?.detected || 'not_detected',
      c.scores?.opportunityScore || 0,
      `"${c.scores?.primaryOffer?.title || ''}"`,
      `"${c.pipeline_stage || c.status || 'NEW'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `growthhunter_empresas_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* TOOLBAR & FILTERS */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Building2 size={24} color="#ff6200" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#1c1917" }}>
              Base de Empresas & Deduplicação ({filteredCompanies.length} registros)
            </h2>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <button className="btn-secondary" onClick={exportCsv} style={{ fontSize: "0.82rem" }}>
              <Download size={15} />
              <span>Exportar CSV</span>
            </button>

            {selectedIds.length > 0 && onDeleteBatch && (
              <button className="btn-secondary" onClick={() => onDeleteBatch(selectedIds)} style={{ fontSize: "0.82rem", color: "#dc2626", borderColor: "#fecaca" }}>
                <Trash2 size={15} color="#dc2626" />
                <span>Excluir Selecionados ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* SEARCH & QUICK FILTERS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem", alignItems: "center" }}>
          
          <div style={{ position: "relative" }}>
            <Search size={15} color="#78716c" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              className="glass-input"
              type="text"
              placeholder="Buscar por nome, cidade, domínio..."
              style={{ width: "100%", paddingLeft: "2rem", fontSize: "0.82rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select 
              className="glass-select"
              style={{ width: "100%", fontSize: "0.82rem" }}
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
            >
              <option value="TODOS">Todos os Nichos</option>
              {niches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div>
            <select 
              className="glass-select"
              style={{ width: "100%", fontSize: "0.82rem" }}
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="TODOS">Todos os Status</option>
              <option value="HOT">🔥 Somente Leads HOT (90+ Score)</option>
              <option value="NO_WEBSITE">🚨 Somente Sem Website</option>
              <option value="BAD_WEBSITE">⚠️ Somente Site Ruim (&lt; 50)</option>
              <option value="NO_PIXEL">❌ Somente Sem Meta Pixel</option>
            </select>
          </div>

          <div>
            <select 
              className="glass-select"
              style={{ width: "100%", fontSize: "0.82rem" }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="score">Ordenar por Score DESC</option>
              <option value="name">Ordenar por Nome A-Z</option>
              <option value="rating">Ordenar por Avaliações (⭐)</option>
            </select>
          </div>

        </div>

      </div>

      {/* DATA TABLE — OFF-WHITE & RADIX ORANGE */}
      <div className="glass-card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "#faf9f6", borderBottom: "1px solid #e8e6e0" }}>
              <th style={{ padding: "0.85rem 1rem", width: "40px", textAlign: "center" }}>
                <button onClick={toggleSelectAll} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
                  {selectedIds.length === filteredCompanies.length && filteredCompanies.length > 0 ? <CheckSquare size={18} color="#ff6200" /> : <Square size={18} />}
                </button>
              </th>
              <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Empresa & Avaliação</th>
              <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Nicho & Região</th>
              <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Website & Rastreamento</th>
              <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Lead Score & Oferta</th>
              <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700", textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#78716c" }}>
                  Nenhuma empresa localizada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company) => {
                const isSelected = selectedIds.includes(company.id);
                const isNoWebsite = company.website_status === "missing" || !company.website;
                const scores = company.scores || {};
                const whatsappUrl = buildWhatsappUrl(company.phone, company.aiAnalysis?.opening_message);

                return (
                  <tr 
                    key={company.id}
                    style={{
                      borderBottom: "1px solid #e8e6e0",
                      background: isSelected ? "#fff7ed" : "transparent"
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                      <button onClick={() => toggleSelectLead(company.id)} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
                        {isSelected ? <CheckSquare size={18} color="#ff6200" /> : <Square size={18} />}
                      </button>
                    </td>

                    {/* Company Name & Rating */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div 
                        style={{ fontWeight: "800", color: "#1c1917", fontSize: "0.92rem", cursor: "pointer" }}
                        onClick={() => onSelectCompany(company)}
                      >
                        {company.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#d97706", display: "flex", alignItems: "center", gap: "0.2rem", marginTop: "2px" }}>
                        <Star size={12} fill="#d97706" color="#d97706" />
                        <span>{company.rating || 4.8} ({company.review_count || company.reviewsCount || 20} avaliações)</span>
                      </div>
                      {company.partners && company.partners.length > 0 && (
                        <span style={{ fontSize: "0.72rem", color: "#16a34a", display: "block", marginTop: "2px" }}>
                          👤 Sócio: {company.partners[0].name}
                        </span>
                      )}
                    </td>

                    {/* Niche & Region */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                        <span className="badge badge-niche">{normalizeSegment(company.niche || company.category)}</span>
                        <span className="badge badge-region"><MapPin size={10} /> {company.city}</span>
                      </div>
                    </td>

                    {/* Website & Tech Tracking */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      {isNoWebsite ? (
                        <span style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: "700" }}>🚨 SEM WEBSITE</span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <a href={buildWebsiteUrl(company.website)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.78rem", color: "#0284c7", fontWeight: "600", textDecoration: "none" }}>
                            🌐 {company.website.replace(/^https?:\/\//, '').substring(0, 22)}...
                          </a>
                          <span style={{ fontSize: "0.72rem", color: company.tech_results?.metaPixel?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                            {company.tech_results?.metaPixel?.detected === "detected" ? "Meta Pixel: ✅" : "Meta Pixel: ❌"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Lead Score & Primary Offer */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="badge" style={{
                          background: scores.classification === "HOT" ? "#fef2f2" : "#fff7ed",
                          color: scores.classification === "HOT" ? "#dc2626" : "#ea580c",
                          fontWeight: "800",
                          border: scores.classification === "HOT" ? "1px solid #fecaca" : "1px solid #ffedd5"
                        }}>
                          SCORE {scores.finalScore || 85}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#57534e", display: "block", marginTop: "3px" }}>
                        Oferta: {scores.primaryOffer?.category || 'SITE'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        <button className="btn-secondary" onClick={() => onSelectCompany(company)} title="Ver Perfil 360º" style={{ padding: "0.35rem 0.55rem" }}>
                          <Eye size={14} />
                        </button>
                        {onOpenEditModal && (
                          <button className="btn-secondary" onClick={() => onOpenEditModal(company)} title="Editar & Buscar Sócios" style={{ padding: "0.35rem 0.55rem" }}>
                            <Edit3 size={14} />
                          </button>
                        )}
                        {onOpenEmailModal && (
                          <button className="btn-secondary" onClick={() => onOpenEmailModal(company)} title="E-mail B2B" style={{ padding: "0.35rem 0.55rem", color: "#0284c7" }}>
                            <Mail size={14} />
                          </button>
                        )}
                        {whatsappUrl && (
                          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" title="WhatsApp" style={{ padding: "0.35rem 0.55rem" }}>
                            <MessageCircle size={14} />
                          </a>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
