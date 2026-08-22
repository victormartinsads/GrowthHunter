import React from "react";
import { 
  Zap, 
  Flame, 
  Building2, 
  Kanban, 
  Briefcase, 
  BarChart3, 
  Settings as SettingsIcon, 
  Search, 
  Trash2, 
  Target, 
  MessageCircle, 
  Activity, 
  Lock, 
  Command 
} from "lucide-react";

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  totalCompanies, 
  hotCompaniesCount, 
  onOpenApifyModal, 
  onClearAllCompanies,
  onOpenCommandPalette,
  onOpenAuthModal,
  currentUser 
}) {
  const navTabs = [
    { id: "prospect_now", label: "Prospectar Agora", icon: Zap, badge: hotCompaniesCount ? `${hotCompaniesCount} HOT` : null, highlight: true },
    { id: "whatsapp", label: "WhatsApp Inbox", icon: MessageCircle, highlight: true },
    { id: "radar", label: "Radar de Oportunidades", icon: Flame },
    { id: "companies", label: "Base de Empresas", icon: Building2, badge: totalCompanies || 0 },
    { id: "pipeline", label: "Pipeline CRM", icon: Kanban },
    { id: "campaigns", label: "Campanhas", icon: Briefcase },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "whatsapp_settings", label: "Config WhatsApp", icon: MessageCircle },
    { id: "system_health", label: "System Health", icon: Activity },
    { id: "settings", label: "Configurações", icon: SettingsIcon }
  ];

  return (
    <header style={{
      background: "rgba(251, 251, 249, 0.94)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid #e8e6e0",
      padding: "0.75rem 1.5rem",
      position: "sticky",
      top: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      boxShadow: "0 2px 10px rgba(28, 25, 23, 0.03)"
    }}>
      {/* Brand & Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          background: "linear-gradient(135deg, #ff6200 0%, #ea580c 100%)",
          padding: "0.5rem",
          borderRadius: "10px",
          display: "flex",
          boxShadow: "0 4px 12px rgba(255, 98, 0, 0.3)"
        }}>
          <Target size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <h1 style={{ fontSize: "1.15rem", fontWeight: "900", letterSpacing: "-0.03em", color: "#1c1917", margin: 0 }}>
              Growth<span style={{ color: "#ff6200" }}>Hunter</span>
            </h1>
            <span className="badge" style={{ background: "#fff7ed", color: "#ea580c", border: "1px solid #ffedd5", fontSize: "0.65rem", fontWeight: "800" }}>
              PROSPECTING CRM
            </span>
          </div>
          <span style={{ fontSize: "0.7rem", color: "#78716c" }}>
            Sales Intelligence & WhatsApp Inbox
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8rem",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#ff6200" : "#57534e",
                background: isActive ? "#fff7ed" : "transparent",
                border: isActive ? "1px solid #ffedd5" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={15} color={isActive ? "#ff6200" : "currentColor"} />
              <span>{tab.label}</span>

              {tab.badge && (
                <span className="badge" style={{
                  background: tab.highlight ? "#fef2f2" : "#f0f9ff",
                  color: tab.highlight ? "#dc2626" : "#0284c7",
                  fontSize: "0.65rem",
                  padding: "0.1rem 0.4rem",
                  marginLeft: "2px"
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Action Buttons & User Tenant */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        
        {/* Command Palette Trigger Button */}
        <button 
          className="btn-secondary"
          onClick={onOpenCommandPalette}
          title="Buscar ou acionar comando (Ctrl + K)"
          style={{ fontSize: "0.78rem", padding: "0.45rem 0.75rem" }}
        >
          <Command size={14} color="#ff6200" />
          <span style={{ fontSize: "0.72rem", color: "#78716c", fontWeight: "700" }}>Ctrl K</span>
        </button>

        <button 
          className="btn-primary"
          onClick={onOpenApifyModal}
          style={{
            fontSize: "0.78rem",
            padding: "0.48rem 0.95rem"
          }}
        >
          <Search size={14} color="#ffffff" />
          <span>Apify</span>
        </button>

        {/* User Auth Modal Button */}
        <button 
          className="btn-secondary"
          onClick={onOpenAuthModal}
          style={{ fontSize: "0.78rem", padding: "0.45rem 0.75rem" }}
        >
          <Lock size={14} color="#16a34a" />
          <span>{currentUser ? currentUser.name.split(" ")[0] : "Tenant Auth"}</span>
        </button>

        {totalCompanies > 0 && (
          <button 
            className="btn-secondary"
            onClick={onClearAllCompanies}
            title="Limpar base para iniciar nova prospecção do zero"
            style={{ fontSize: "0.78rem", padding: "0.45rem 0.65rem", color: "#dc2626", borderColor: "#fecaca" }}
          >
            <Trash2 size={14} color="#dc2626" />
          </button>
        )}

      </div>
    </header>
  );
}
