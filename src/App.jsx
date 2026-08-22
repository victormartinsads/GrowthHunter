import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import ProspectNowView from "./components/ProspectNowView";
import OpportunityRadarView from "./components/OpportunityRadarView";
import CompanyDatabaseView from "./components/CompanyDatabaseView";
import CrmPipelineView from "./components/CrmPipelineView";
import CampaignsView from "./components/CampaignsView";
import DashboardView from "./components/DashboardView";
import SettingsView from "./components/SettingsView";
import WhatsAppInboxView from "./components/WhatsAppInboxView";
import WhatsAppSettingsView from "./components/WhatsAppSettingsView";
import SystemHealthView from "./components/SystemHealthView";

import ApifyLeadFinderModal from "./components/ApifyLeadFinderModal";
import LeadProfileModal from "./components/LeadProfileModal";
import LeadEditModal from "./components/LeadEditModal";
import EmailProspectingModal from "./components/EmailProspectingModal";
import CommandPaletteModal from "./components/CommandPaletteModal";
import AuthModal from "./components/AuthModal";
import ToastNotification from "./components/ToastNotification";

import { deduplicateCompanies } from "./utils/deduplication";
import { detectTechnologiesInHtml, calculateWebsiteScore } from "./utils/websiteAnalyzer";
import { evaluateCompanyOpportunities, calculateLeadScores } from "./utils/scoringEngine";
import { generateAiLeadAnalysis } from "./utils/aiLeadAnalyst";
import {
  fetchAllCompanies,
  upsertManyCompanies,
  updateCompany,
  deleteCompany,
  deleteAllCompanies,
  migrateFromLocalStorage,
  isMigrationDone,
} from "./utils/dataService";

// Função auxiliar de enriquecimento no nível do módulo
const processAndEnrichCompany = (comp, orgName = "growthhunter_tenant_default") => {
  const hasWebsite = Boolean(comp.website && String(comp.website).trim() !== "");

  const techResults = comp.tech_results || detectTechnologiesInHtml(
    hasWebsite ? `<html><head><title>${comp.name}</title></head><body></body></html>` : "",
    comp.website
  );

  const websiteScore = calculateWebsiteScore(comp, techResults);
  const opportunities = evaluateCompanyOpportunities(comp, techResults, websiteScore);
  const scores = calculateLeadScores(comp, techResults, websiteScore, opportunities);
  const aiAnalysis = generateAiLeadAnalysis(comp, scores, techResults, websiteScore);

  const strHash = Math.abs((comp.name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const realRating = Number(comp.rating) > 0 ? Number(comp.rating) : Number((3.8 + (strHash % 12) * 0.1).toFixed(1));
  const realReviews = Number(comp.review_count || comp.reviewsCount) > 0 ? Number(comp.review_count || comp.reviewsCount) : (strHash * 13) % 220 + 3;

  return {
    ...comp,
    rating: realRating,
    review_count: realReviews,
    organization_id: orgName,
    source: comp.source || "google_maps",
    website_status: hasWebsite ? (websiteScore.totalScore < 50 ? "bad" : "good") : "missing",
    tech_results: techResults,
    website_score: websiteScore,
    opportunities,
    scores,
    aiAnalysis,
    pipeline_stage: comp.pipeline_stage || comp.status || "NEW",
    status: comp.status || "Novo Lead",
    created_at: comp.created_at || new Date().toISOString()
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState("prospect_now");
  const [dbLoading, setDbLoading] = useState(true);

  // User Auth & Tenant State
  const [currentUser, setCurrentUser] = useState({
    id: "user_owner_1",
    name: "Alexandre Sales",
    email: "alexandre@growthhunter.io",
    role: "OWNER",
    orgName: "GrowthHunter SaaS Tenant"
  });

  // Leads — carregados do Supabase ao montar
  const [companies, setCompanies] = useState([]);

  // Modals states
  const [isApifyModalOpen, setIsApifyModalOpen] = useState(false);
  const [selectedCompanyForProfile, setSelectedCompanyForProfile] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [emailTargetCompany, setEmailTargetCompany] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info", duration = 3500) => {
    setToast({ message, type, duration });
  };

  // ── Boot: migrar localStorage → Supabase (primeira vez) e carregar dados ──
  useEffect(() => {
    async function boot() {
      setDbLoading(true);
      try {
        // Migração única: se ainda tem dados no localStorage, sobe para Supabase
        if (!isMigrationDone()) {
          const result = await migrateFromLocalStorage();
          if (result.migrated > 0) {
            showToast(`☁️ ${result.migrated} leads migrados do armazenamento local para o banco de dados!`, "success", 5000);
          }
        }
        // Carrega todos os leads do Supabase
        const data = await fetchAllCompanies();
        const enriched = data.map(c => processAndEnrichCompany(c, currentUser?.orgName));
        setCompanies(enriched);
      } catch (err) {
        console.error("[Boot] Erro ao carregar dados do Supabase:", err);
        showToast("⚠️ Erro ao conectar com o banco de dados.", "error");
      } finally {
        setDbLoading(false);
      }
    }
    boot();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Contagem de HOT Leads (Score 90+)
  const hotCompaniesCount = useMemo(() => {
    return companies.filter(c => (c.scores?.finalScore || 0) >= 90).length;
  }, [companies]);

  // ── Importar Novas Empresas ──
  const handleImportCompanies = async (newLeads) => {
    const processed = newLeads.map(c => processAndEnrichCompany(c, currentUser?.orgName));
    const { uniqueCompanies, inserted, duplicateCount } = deduplicateCompanies(companies, processed);

    // Salva no Supabase em batch
    await upsertManyCompanies(inserted);
    setCompanies(uniqueCompanies);

    if (duplicateCount > 0) {
      showToast(`🎉 ${inserted.length} novas empresas adicionadas. ${duplicateCount} duplicadas foram ignoradas!`, "success");
    } else {
      showToast(`🎉 ${inserted.length} novas empresas importadas com sucesso!`, "success");
    }
  };

  // ── Atualizar Estágio do Pipeline ──
  const handleUpdatePipelineStage = async (companyId, newStageId) => {
    setCompanies(prev => prev.map(c =>
      c.id === companyId ? { ...c, pipeline_stage: newStageId, status: newStageId } : c
    ));
    await updateCompany(companyId, { pipeline_stage: newStageId, status: newStageId });
    showToast("📋 Estágio do CRM atualizado!", "success");
  };

  // ── Atualizar Múltiplas Empresas para um Estágio do Kanban ──
  const handleBatchUpdatePipelineStage = async (companyIds, newStageId = "QUALIFIED") => {
    if (!companyIds || companyIds.length === 0) return;
    
    setCompanies(prev => prev.map(c =>
      companyIds.includes(c.id) ? { ...c, pipeline_stage: newStageId, status: newStageId } : c
    ));

    await Promise.all(
      companyIds.map(id => updateCompany(id, { pipeline_stage: newStageId, status: newStageId }))
    );

    showToast(`🎯 ${companyIds.length} empresa(s) movidas para o Kanban (${newStageId})!`, "success", 4000);
  };

  // ── Atualizar Empresa ──
  const handleSaveCompany = async (updatedCompany) => {
    const reProcessed = processAndEnrichCompany(updatedCompany);
    setCompanies(prev => prev.map(c => c.id === reProcessed.id ? reProcessed : c));
    await upsertManyCompanies([reProcessed]);
    showToast("✅ Empresa atualizada com sucesso!", "success");
  };

  // ── Excluir em Batch ──
  const handleDeleteBatch = async (idsToDelete) => {
    if (window.confirm(`Deseja realmente remover ${idsToDelete.length} empresa(s)?`)) {
      setCompanies(prev => prev.filter(c => !idsToDelete.includes(c.id)));
      await Promise.all(idsToDelete.map(id => deleteCompany(id)));
      showToast("🗑️ Empresas removidas da base.", "info");
    }
  };

  // ── Limpar Toda a Base ──
  const handleClearAllCompanies = async () => {
    if (window.confirm("Deseja apagar TODAS as empresas para começar uma prospecção limpa?")) {
      setCompanies([]);
      await deleteAllCompanies();
      showToast("🗑️ Base de empresas limpa! Clique em 'Nova Prospecção Apify'.", "info");
    }
  };



  // Adicionar Tarefa a uma Empresa
  const handleAddTask = (companyId, task) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const existingTasks = c.tasks || [];
        return {
          ...c,
          tasks: [...existingTasks, task]
        };
      }
      return c;
    }));
    showToast("📅 Nova tarefa agendada!", "success");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-offwhite)" }}>
      
      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCompanies={companies.length}
        hotCompaniesCount={hotCompaniesCount}
        onOpenApifyModal={() => setIsApifyModalOpen(true)}
        onClearAllCompanies={handleClearAllCompanies}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Container Views */}
      <main className="app-container" style={{ flex: 1, paddingTop: "1.25rem", paddingBottom: "3rem" }}>
        
        {/* 1. Prospectar Agora (Smart Queue) */}
        {activeTab === "prospect_now" && (
          <ProspectNowView 
            companies={companies}
            onSelectCompany={(comp) => setSelectedCompanyForProfile(comp)}
            onUpdatePipelineStage={handleUpdatePipelineStage}
            onBatchUpdatePipelineStage={handleBatchUpdatePipelineStage}
            onNavigateTab={setActiveTab}
            onOpenEmailModal={(comp) => { setEmailTargetCompany(comp); setIsEmailModalOpen(true); }}
            onOpenApifyModal={() => setIsApifyModalOpen(true)}
          />
        )}

        {/* 2. WhatsApp Inbox */}
        {activeTab === "whatsapp" && (
          <WhatsAppInboxView 
            companies={companies}
            onSelectCompany={(comp) => setSelectedCompanyForProfile(comp)}
            onUpdatePipelineStage={handleUpdatePipelineStage}
          />
        )}

        {/* 3. Radar de Oportunidades */}
        {activeTab === "radar" && (
          <OpportunityRadarView 
            companies={companies}
            onSelectFilter={(filterType) => setActiveTab("companies")}
          />
        )}

        {/* 4. Base de Empresas */}
        {activeTab === "companies" && (
          <CompanyDatabaseView 
            companies={companies}
            onSelectCompany={(comp) => setSelectedCompanyForProfile(comp)}
            onOpenEditModal={(comp) => { setEditingCompany(comp); setIsEditModalOpen(true); }}
            onOpenEmailModal={(comp) => { setEmailTargetCompany(comp); setIsEmailModalOpen(true); }}
            onDeleteBatch={handleDeleteBatch}
            onBatchUpdatePipelineStage={handleBatchUpdatePipelineStage}
          />
        )}

        {/* 5. Pipeline CRM */}
        {activeTab === "pipeline" && (
          <CrmPipelineView 
            companies={companies}
            onUpdatePipelineStage={handleUpdatePipelineStage}
            onSelectCompany={(comp) => setSelectedCompanyForProfile(comp)}
            onOpenEditModal={(comp) => { setEditingCompany(comp); setIsEditModalOpen(true); }}
            onOpenEmailModal={(comp) => { setEmailTargetCompany(comp); setIsEmailModalOpen(true); }}
          />
        )}

        {/* 6. Campanhas */}
        {activeTab === "campaigns" && (
          <CampaignsView 
            existingCompanies={companies}
            onImportCampaignLeads={handleImportCompanies}
          />
        )}

        {/* 7. Dashboard */}
        {activeTab === "dashboard" && (
          <DashboardView 
            companies={companies}
            onStartRoute={() => setActiveTab("prospect_now")}
          />
        )}

        {/* 8. Config WhatsApp */}
        {activeTab === "whatsapp_settings" && (
          <WhatsAppSettingsView showToast={showToast} />
        )}

        {/* 9. System Health */}
        {activeTab === "system_health" && (
          <SystemHealthView />
        )}

        {/* 10. Configurações Globais */}
        {activeTab === "settings" && (
          <SettingsView showToast={showToast} />
        )}

      </main>

      {/* MODALS */}
      
      {/* Buscador Apify */}
      <ApifyLeadFinderModal 
        isOpen={isApifyModalOpen}
        onClose={() => setIsApifyModalOpen(false)}
        onImportLeads={handleImportCompanies}
      />

      {/* Perfil 360º da Empresa */}
      <LeadProfileModal 
        isOpen={Boolean(selectedCompanyForProfile)}
        company={selectedCompanyForProfile}
        onClose={() => setSelectedCompanyForProfile(null)}
        onOpenEditModal={(comp) => { setEditingCompany(comp); setIsEditModalOpen(true); }}
        onOpenEmailModal={(comp) => { setEmailTargetCompany(comp); setIsEmailModalOpen(true); }}
        onAddTask={handleAddTask}
        onUpdatePipelineStage={handleUpdatePipelineStage}
      />

      {/* Modal Edição da Empresa */}
      <LeadEditModal 
        isOpen={isEditModalOpen}
        lead={editingCompany}
        onClose={() => { setIsEditModalOpen(false); setEditingCompany(null); }}
        onSave={handleSaveCompany}
      />

      {/* Modal Prospecção por E-mail */}
      <EmailProspectingModal 
        isOpen={isEmailModalOpen}
        lead={emailTargetCompany}
        onClose={() => { setIsEmailModalOpen(false); setEmailTargetCompany(null); }}
      />

      {/* Command Palette (Ctrl + K) */}
      <CommandPaletteModal 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        companies={companies}
        onNavigate={(tab) => setActiveTab(tab)}
        onSelectCompany={(comp) => setSelectedCompanyForProfile(comp)}
      />

      {/* Auth Multi-Tenant Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(userData) => { setCurrentUser(userData); showToast(`Autenticado como ${userData.name}`, "success"); }}
        onRegister={(userData) => { setCurrentUser(userData); showToast(`Organização ${userData.orgName} registrada!`, "success"); }}
      />

      {/* Toast Notification Banner */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
