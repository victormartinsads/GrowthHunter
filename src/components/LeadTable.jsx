import React, { useState, useMemo } from "react";
import { 
  Search, Filter, Phone, Globe, MapPin, 
  Trash2, ExternalLink, Download, Edit3, MessageCircle, X, Check, CheckSquare, Square, Eye, Sparkles, Mail
} from "lucide-react";
import { exportLeadsToCsv } from "../utils/csvParser";
import { buildWhatsappUrl, buildInstagramUrl, buildWebsiteUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function LeadTable({ 
  leads, 
  onUpdateLeadStatus, 
  onUpdateLead, 
  onOpenEditModal,
  onOpenEmailModal,
  onDeleteLead, 
  onDeleteBatch,
  onStartRouteWithLeads,
  onEnrichLead,
  onEnrichBatchLeads,
  selectedNicheFilter,
  setSelectedNicheFilter,
  selectedRegionFilter,
  setSelectedRegionFilter
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingLead, setEditingLead] = useState(null);

  // Lista dinâmica de Nichos e Regiões disponíveis nos leads
  const availableNiches = useMemo(() => {
    const set = new Set(leads.map(l => l.niche).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  const availableRegions = useMemo(() => {
    const set = new Set(leads.map(l => l.city).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  // Filtragem dos Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Filtro de Nicho
      if (selectedNicheFilter !== "TODOS" && lead.niche !== selectedNicheFilter) {
        return false;
      }
      // Filtro de Região/Cidade
      if (selectedRegionFilter !== "TODOS" && lead.city !== selectedRegionFilter) {
        return false;
      }
      // Filtro de Status
      if (statusFilter !== "TODOS" && lead.status !== statusFilter) {
        return false;
      }
      // Busca textual
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = lead.name?.toLowerCase().includes(term);
        const matchesPhone = lead.phone?.includes(term);
        const matchesNiche = lead.niche?.toLowerCase().includes(term);
        const matchesCity = lead.city?.toLowerCase().includes(term);
        const matchesAudit = lead.digitalAudit?.toLowerCase().includes(term);
        if (!matchesName && !matchesPhone && !matchesNiche && !matchesCity && !matchesAudit) {
          return false;
        }
      }
      return true;
    });
  }, [leads, selectedNicheFilter, selectedRegionFilter, statusFilter, searchTerm]);

  // Seleção de checkboxes
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportSelected = () => {
    const leadsToExport = leads.filter(l => selectedIds.includes(l.id));
    exportLeadsToCsv(leadsToExport.length > 0 ? leadsToExport : filteredLeads, "leads_organizados.csv");
  };

  const handleStartRouteFromSelected = () => {
    const targetLeads = leads.filter(l => selectedIds.includes(l.id));
    onStartRouteWithLeads(targetLeads.length > 0 ? targetLeads : filteredLeads);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} leads selecionados?`)) {
      onDeleteBatch(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Search & Combined Filter Bar */}
      <div className="glass-card" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Top Bar: Search Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
              <Search 
                size={18} 
                color="var(--text-muted)" 
                style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} 
              />
              <input 
                type="text"
                className="glass-input"
                placeholder="Buscar por Empresa, Telefone, Nicho, Cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer"
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button className="btn-secondary" onClick={handleExportSelected} title="Exportar para CSV">
              <Download size={16} />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Filters Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.85rem",
            alignItems: "center"
          }}>
            {/* Filter by Niche */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                Filtrar por Nicho:
              </label>
              <select 
                className="glass-select"
                style={{ width: "100%" }}
                value={selectedNicheFilter}
                onChange={(e) => setSelectedNicheFilter(e.target.value)}
              >
                <option value="TODOS">Todos os Nichos ({availableNiches.length})</option>
                {availableNiches.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Filter by Region */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                Filtrar por Região / Cidade:
              </label>
              <select 
                className="glass-select"
                style={{ width: "100%" }}
                value={selectedRegionFilter}
                onChange={(e) => setSelectedRegionFilter(e.target.value)}
              >
                <option value="TODOS">Todas as Regiões ({availableRegions.length})</option>
                {availableRegions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Filter by Funnel Status */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                Status no Funil:
              </label>
              <select 
                className="glass-select"
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="TODOS">Todos os Status</option>
                <option value="Novo Lead">Novo Lead</option>
                <option value="Abordado">Abordado</option>
                <option value="Reunião Agendada">Reunião Agendada</option>
                <option value="Proposta Enviada">Proposta Enviada</option>
                <option value="Cliente Fechado">Cliente Fechado</option>
                <option value="Perdido">Perdido</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedNicheFilter !== "TODOS" || selectedRegionFilter !== "TODOS" || statusFilter !== "TODOS" || searchTerm) && (
              <div style={{ display: "flex", alignItems: "flex-end", height: "100%", paddingTop: "1rem" }}>
                <button 
                  className="btn-secondary"
                  style={{ fontSize: "0.8rem", padding: "0.5rem 0.85rem", color: "#f87171", width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setSelectedNicheFilter("TODOS");
                    setSelectedRegionFilter("TODOS");
                    setStatusFilter("TODOS");
                    setSearchTerm("");
                  }}
                >
                  <X size={14} />
                  <span>Limpar Filtros</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(30, 41, 59, 0.9) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#34d399" }}>
            ✓ {selectedIds.length} lead(s) selecionado(s)
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button 
              className="btn-secondary" 
              onClick={() => onEnrichBatchLeads(selectedIds)} 
              style={{ color: "#34d399", borderColor: "rgba(16, 185, 129, 0.4)", fontSize: "0.85rem" }}
            >
              <Sparkles size={16} color="#10b981" />
              <span>🔎 Caçar Site & Redes ({selectedIds.length})</span>
            </button>
            <button className="btn-primary" onClick={handleStartRouteFromSelected} style={{ fontSize: "0.85rem" }}>
              <MapPin size={16} />
              <span>Gerar Rota para Selecionados</span>
            </button>
            <button className="btn-secondary" onClick={handleDeleteSelected} style={{ color: "#f87171", fontSize: "0.85rem" }}>
              <Trash2 size={16} />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
          Exibindo <strong>{filteredLeads.length}</strong> de <strong>{leads.length}</strong> leads cadastrados
        </span>
      </div>

      {/* Leads Table Container */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{
                background: "rgba(15, 23, 42, 0.8)",
                borderBottom: "1px solid var(--border-color)",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                <th style={{ padding: "0.85rem 1rem", width: "40px", textAlign: "center" }}>
                  <button 
                    onClick={toggleSelectAll} 
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredLeads.length ? (
                      <CheckSquare size={18} color="#10b981" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th style={{ padding: "0.85rem 1rem" }}>Empresa / Lead</th>
                <th style={{ padding: "0.85rem 1rem" }}>Nicho & Cidade</th>
                <th style={{ padding: "0.85rem 1rem" }}>E-mail & Redes</th>
                <th style={{ padding: "0.85rem 1rem" }}>WhatsApp / Fone</th>
                <th style={{ padding: "0.85rem 1rem" }}>Status Funil</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Nenhum lead encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const whatsappUrl = buildWhatsappUrl(lead.phone);
                  const instagramUrl = buildInstagramUrl(lead.instagram, lead.name);
                  const websiteUrl = buildWebsiteUrl(lead.website);

                  return (
                    <tr 
                      key={lead.id}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        background: isSelected ? "rgba(16, 185, 129, 0.06)" : "transparent",
                        transition: "background 0.15s ease"
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                        <button 
                          onClick={() => toggleSelectLead(lead.id)}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                        >
                          {isSelected ? <CheckSquare size={18} color="#10b981" /> : <Square size={18} />}
                        </button>
                      </td>

                      {/* Lead Name & Audit */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.92rem" }}>
                          {lead.name}
                        </div>
                        {lead.digitalAudit && (
                          <span style={{ fontSize: "0.72rem", color: "#f59e0b", display: "inline-block", marginTop: "2px" }}>
                            ⚠️ {lead.digitalAudit}
                          </span>
                        )}
                      </td>

                      {/* Niche & Region Badges */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                          <span className="badge badge-niche">
                            {normalizeSegment(lead.niche)}
                          </span>
                          <span className="badge badge-region">
                            <MapPin size={11} />
                            {lead.neighborhood ? `${lead.city} - ${lead.neighborhood}` : lead.city || "Geral"}
                          </span>
                        </div>
                      </td>

                      {/* Email & Socials */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            {lead.email ? (
                              <button 
                                onClick={() => onOpenEmailModal && onOpenEmailModal(lead)}
                                className="btn-secondary"
                                style={{ padding: "0.25rem 0.55rem", fontSize: "0.75rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)" }}
                                title="Abrir Gerador de E-mail B2B"
                              >
                                <Mail size={12} />
                                <span>{lead.email}</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => onOpenEmailModal && onOpenEmailModal(lead)}
                                style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                                title="Criar E-mail para este lead"
                              >
                                + Gerar E-mail
                              </button>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                            {websiteUrl && (
                              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#60a5fa", textDecoration: "none", fontWeight: "600" }}>
                                🌐 Site
                              </a>
                            )}
                            {instagramUrl && (
                              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#c084fc", textDecoration: "none", fontWeight: "600" }}>
                                📱 Instagram
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp Button */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {whatsappUrl ? (
                          <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-whatsapp"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
                          >
                            <MessageCircle size={14} />
                            <span>{lead.phone}</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Sem WhatsApp</span>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <select
                          className="glass-select"
                          value={lead.status}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                          style={{
                            fontSize: "0.78rem",
                            padding: "0.35rem 0.65rem",
                            fontWeight: "600",
                            borderRadius: "9999px"
                          }}
                        >
                          <option value="Novo Lead">Novo Lead</option>
                          <option value="Abordado">Abordado</option>
                          <option value="Reunião Agendada">Reunião Agendada</option>
                          <option value="Proposta Enviada">Proposta Enviada</option>
                          <option value="Cliente Fechado">Cliente Fechado</option>
                          <option value="Perdido">Perdido</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                          <button 
                            className="btn-secondary"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.3)" }}
                            title="Caçar Website, Instagram e Meta Pixel"
                            onClick={() => onEnrichLead(lead)}
                          >
                            <Sparkles size={13} color="#10b981" />
                            <span>Rastrear</span>
                          </button>
                          <button 
                            className="btn-secondary"
                            style={{ padding: "0.35rem 0.5rem" }}
                            title="Editar / Ver Detalhes"
                            onClick={() => onOpenEditModal(lead)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="btn-secondary"
                            style={{ padding: "0.35rem 0.5rem", color: "#f87171" }}
                            title="Excluir Lead"
                            onClick={() => {
                              if (window.confirm(`Excluir "${lead.name}"?`)) onDeleteLead(lead.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* EDIT / DETAIL DRAWER MODAL */}
      {editingLead && (
        <div className="modal-overlay" onClick={() => setEditingLead(null)}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "540px", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Editar Lead</h3>
              <button onClick={() => setEditingLead(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Nome da Empresa:</label>
                <input 
                  type="text" 
                  className="glass-input"
                  value={editingLead.name} 
                  onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Nicho:</label>
                  <input 
                    type="text" 
                    className="glass-input"
                    value={editingLead.niche} 
                    onChange={e => setEditingLead({ ...editingLead, niche: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Cidade:</label>
                  <input 
                    type="text" 
                    className="glass-input"
                    value={editingLead.city} 
                    onChange={e => setEditingLead({ ...editingLead, city: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>E-mail de Contato:</label>
                  <input 
                    type="email" 
                    className="glass-input"
                    value={editingLead.email || ""} 
                    onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>CNPJ:</label>
                  <input 
                    type="text" 
                    className="glass-input"
                    placeholder="00.000.000/0001-00"
                    value={editingLead.cnpj || ""} 
                    onChange={e => setEditingLead({ ...editingLead, cnpj: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Bairro:</label>
                  <input 
                    type="text" 
                    className="glass-input"
                    value={editingLead.neighborhood || ""} 
                    onChange={e => setEditingLead({ ...editingLead, neighborhood: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>WhatsApp (Com DDD):</label>
                  <input 
                    type="text" 
                    className="glass-input"
                    value={editingLead.phone || ""} 
                    onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Auditoria de Tráfego (Ex: Sem Pixel, Sem Ads):</label>
                <input 
                  type="text" 
                  className="glass-input"
                  value={editingLead.digitalAudit || ""} 
                  onChange={e => setEditingLead({ ...editingLead, digitalAudit: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Observações / Histórico:</label>
                <textarea 
                  className="glass-input"
                  rows={3}
                  value={editingLead.notes || ""} 
                  onChange={e => setEditingLead({ ...editingLead, notes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button className="btn-secondary" onClick={() => setEditingLead(null)}>Cancelar</button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    onUpdateLead(editingLead);
                    setEditingLead(null);
                  }}
                >
                  <Check size={16} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
