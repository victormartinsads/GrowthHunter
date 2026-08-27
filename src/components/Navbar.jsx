import React, { useState, useRef, useEffect } from "react";
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
  Command,
  ChevronDown,
  Sparkles,
  Sliders,
  Smartphone
} from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon";

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  totalCompanies = 0, 
  hotCompaniesCount = 0, 
  onOpenApifyModal, 
  onClearAllCompanies,
  onOpenCommandPalette,
  onOpenAuthModal,
  currentUser 
}) {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsToolsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 7 Primary Workflow Tabs (Hick's Law / Chunking)
  const primaryTabs = [
    { 
      id: "prospect_now", 
      label: "Prospectar Agora", 
      icon: Zap, 
      badge: hotCompaniesCount > 0 ? `${hotCompaniesCount} HOT` : null, 
      highlight: true 
    },
    { 
      id: "cnpj_database", 
      label: "Base CNPJ (Receita)", 
      icon: Building2, 
      badge: "28M", 
      highlight: false 
    },
    { 
      id: "instagram", 
      label: "Instagram Direct", 
      icon: InstagramIcon, 
      highlight: false 
    },
    { 
      id: "pipeline", 
      label: "Pipeline CRM", 
      icon: Kanban 
    },
    { 
      id: "whatsapp", 
      label: "WhatsApp Inbox", 
      icon: MessageCircle, 
      highlight: false 
    },
    { 
      id: "radar", 
      label: "Radar de Oportunidades", 
      icon: Flame 
    },
    { 
      id: "companies", 
      label: "Base de Empresas", 
      icon: Briefcase, 
      badge: totalCompanies > 0 ? totalCompanies : null 
    },
    { 
      id: "campaigns", 
      label: "Scripts & Copy", 
      icon: Sparkles 
    }
  ];

  // Secondary Tools (Progressive Disclosure)
  const secondaryTabs = [
    { id: "salesperson_app", label: "Fila da Vendedora (Mobile App)", icon: Smartphone, desc: "Modo de prospecção rápida 1-toque no celular" },
    { id: "dashboard", label: "Dashboard & Métricas", icon: BarChart3, desc: "Desempenho e volume de prospecção" },
    { id: "whatsapp_settings", label: "Configuração WhatsApp Cloud", icon: MessageCircle, desc: "Tokens e WABA ID Oficial" },
    { id: "settings", label: "Configurações de Chaves API", icon: SettingsIcon, desc: "Supabase, OpenAI, Apify, PageSpeed" },
    { id: "system_health", label: "System Health & Status", icon: Activity, desc: "Status de APIs e servidores" }
  ];

  const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);

  return (
    <header style={{
      background: "rgba(251, 251, 249, 0.96)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid #e8e6e0",
      padding: "0.65rem 1.5rem",
      position: "sticky",
      top: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      boxShadow: "0 2px 12px rgba(28, 25, 23, 0.03)"
    }}>
      {/* ── Brand Logo ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }} onClick={() => setActiveTab("prospect_now")}>
        <div style={{
          background: "linear-gradient(135deg, #ff6200 0%, #ea580c 100%)",
          padding: "0.45rem",
          borderRadius: "10px",
          display: "flex",
          boxShadow: "0 3px 10px rgba(255, 98, 0, 0.25)"
        }}>
          <Target size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <h1 style={{ fontSize: "1.1rem", fontWeight: "900", letterSpacing: "-0.03em", color: "#1c1917", margin: 0 }}>
              Growth<span style={{ color: "#ff6200" }}>Hunter</span>
            </h1>
            <span className="badge" style={{ background: "#fff7ed", color: "#ea580c", border: "1px solid #ffedd5", fontSize: "0.62rem", fontWeight: "800", padding: "0.1rem 0.4rem" }}>
              CRM
            </span>
          </div>
          <span style={{ fontSize: "0.68rem", color: "#78716c" }}>
            Sales Intelligence & Outreach
          </span>
        </div>
      </div>

      {/* ── Primary Navigation Tabs ── */}
      <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
        {primaryTabs.map((tab) => {
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
                padding: "0.42rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: isActive ? "800" : "600",
                color: isActive ? "#ea580c" : "#57534e",
                background: isActive ? "#fff7ed" : "transparent",
                border: isActive ? "1px solid #ffedd5" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap"
              }}
            >
              <Icon size={15} color={isActive ? "#ea580c" : "#78716c"} />
              <span>{tab.label}</span>

              {tab.badge && (
                <span style={{
                  background: tab.highlight ? "#fef2f2" : "#f0f9ff",
                  color: tab.highlight ? "#dc2626" : "#0284c7",
                  fontSize: "0.65rem",
                  fontWeight: "800",
                  padding: "0.1rem 0.45rem",
                  borderRadius: "999px",
                  border: tab.highlight ? "1px solid #fecaca" : "1px solid #bae6fd",
                  marginLeft: "2px"
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* ── Secondary Tools Dropdown (Progressive Disclosure) ── */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.42rem 0.75rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: isSecondaryActive ? "800" : "600",
              color: isSecondaryActive ? "#ea580c" : "#57534e",
              background: isSecondaryActive ? "#fff7ed" : "transparent",
              border: isSecondaryActive ? "1px solid #ffedd5" : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <Sliders size={14} color={isSecondaryActive ? "#ea580c" : "#78716c"} />
            <span>Ferramentas</span>
            <ChevronDown size={13} color={isSecondaryActive ? "#ea580c" : "#78716c"} />
          </button>

          {/* Dropdown Menu */}
          {isToolsDropdownOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "#ffffff",
              border: "1px solid #e8e6e0",
              borderRadius: "12px",
              boxShadow: "0 12px 28px -4px rgba(0,0,0,0.12)",
              padding: "0.4rem",
              minWidth: "240px",
              zIndex: 200,
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem"
            }}>
              {secondaryTabs.map((item) => {
                const ItemIcon = item.icon;
                const isItemActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsToolsDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.6rem",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "8px",
                      background: isItemActive ? "#fff7ed" : "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%",
                      transition: "background 0.15s"
                    }}
                  >
                    <ItemIcon size={16} color={isItemActive ? "#ea580c" : "#78716c"} style={{ marginTop: "2px" }} />
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: isItemActive ? "800" : "600", color: isItemActive ? "#ea580c" : "#1c1917" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#a8a29e" }}>
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* ── Action Bar (Search & User) ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        
        {/* Command Palette Trigger Button */}
        <button 
          className="btn-secondary"
          onClick={onOpenCommandPalette}
          title="Buscar ou acionar comando rápido (Ctrl + K)"
          style={{ fontSize: "0.78rem", padding: "0.42rem 0.7rem" }}
        >
          <Command size={14} color="#ea580c" />
          <span style={{ fontSize: "0.72rem", color: "#78716c", fontWeight: "700" }}>Ctrl K</span>
        </button>

        {/* Primary CTA: Nova Busca de Leads */}
        <button 
          className="btn-primary"
          onClick={onOpenApifyModal}
          style={{
            fontSize: "0.82rem",
            padding: "0.45rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "linear-gradient(135deg, #ff6200 0%, #ea580c 100%)",
            border: "none"
          }}
        >
          <Search size={14} color="#ffffff" />
          <span>Nova Busca</span>
        </button>

        {/* User Auth Modal Button */}
        <button 
          className="btn-secondary"
          onClick={onOpenAuthModal}
          title="Configuração de Usuário e Multi-Tenant"
          style={{ fontSize: "0.78rem", padding: "0.42rem 0.75rem" }}
        >
          <Lock size={13} color="#16a34a" />
          <span>{currentUser ? currentUser.name.split(" ")[0] : "Tenant"}</span>
        </button>

        {/* Clear Database Button */}
        {totalCompanies > 0 && (
          <button 
            className="btn-secondary"
            onClick={onClearAllCompanies}
            title="Limpar base para iniciar nova prospecção do zero"
            style={{ fontSize: "0.78rem", padding: "0.42rem 0.6rem", color: "#dc2626", borderColor: "#fecaca" }}
          >
            <Trash2 size={14} color="#dc2626" />
          </button>
        )}

      </div>
    </header>
  );
}
