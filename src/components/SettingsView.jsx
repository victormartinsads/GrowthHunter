import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Key, Server, CheckCircle2, Save, Cloud, Loader2 } from "lucide-react";
import { fetchAppSettings, saveAppSettings } from "../utils/dataService";

export default function SettingsView({ showToast }) {
  const [apifyToken, setApifyToken] = useState(() => localStorage.getItem("APIFY_API_TOKEN") || "");
  const [pageSpeedKey, setPageSpeedKey] = useState(() => localStorage.getItem("GOOGLE_PAGESPEED_API_KEY") || "");
  const [openAiKey, setOpenAiKey] = useState(() => localStorage.getItem("OPENAI_API_KEY") || "");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Carrega as chaves do Supabase ao montar
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const settings = await fetchAppSettings();
        if (settings && isMounted) {
          if (settings.apify_api_token) {
            setApifyToken(settings.apify_api_token);
            localStorage.setItem("APIFY_API_TOKEN", settings.apify_api_token);
          }
          if (settings.pagespeed_api_key) {
            setPageSpeedKey(settings.pagespeed_api_key);
            localStorage.setItem("GOOGLE_PAGESPEED_API_KEY", settings.pagespeed_api_key);
          }
          if (settings.openai_api_key) {
            setOpenAiKey(settings.openai_api_key);
            localStorage.setItem("OPENAI_API_KEY", settings.openai_api_key);
          }
          setIsCloudSynced(true);
        }
      } catch (err) {
        console.error("Erro ao carregar configurações do Supabase:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSettings();
    return () => { isMounted = false; };
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Salva no localStorage imediatamente
    localStorage.setItem("APIFY_API_TOKEN", apifyToken);
    localStorage.setItem("GOOGLE_PAGESPEED_API_KEY", pageSpeedKey);
    localStorage.setItem("OPENAI_API_KEY", openAiKey);

    // Salva no Supabase (Nuvem)
    try {
      const res = await saveAppSettings({
        apifyToken,
        pageSpeedKey,
        openAiKey
      });

      if (res.success) {
        setIsCloudSynced(true);
        if (showToast) {
          showToast("☁️ Chaves salvas com sucesso no banco Supabase & localmente!", "success");
        }
      } else {
        if (showToast) {
          showToast("⚠️ Salvo localmente, mas houve erro ao sincronizar com Supabase.", "warning");
        }
      }
    } catch (err) {
      console.error("Erro ao salvar no Supabase:", err);
      if (showToast) {
        showToast("⚠️ Salvo localmente no navegador.", "info");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* HEADER BANNER — OFF-WHITE & RADIX ORANGE */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #ffffff 100%)",
        border: "1px solid #fed7aa",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <SettingsIcon size={26} color="#ff6200" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
              ⚙️ CONFIGURAÇÕES & CHAVES API (SINCRONIZADAS NO BANCO)
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
            Suas chaves do Apify, Google PageSpeed e OpenAI ficam salvas com segurança no <strong>Supabase</strong> e sincronizam automaticamente entre todos os seus dispositivos.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#ffffff", padding: "0.45rem 0.85rem", borderRadius: "999px", border: "1px solid #fed7aa" }}>
          <Cloud size={16} color={isCloudSynced ? "#16a34a" : "#ca8a04"} />
          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: isCloudSynced ? "#16a34a" : "#ca8a04" }}>
            {loading ? "Conectando ao banco..." : isCloudSynced ? "Nuvem Supabase Ativa" : "Sincronizando..."}
          </span>
        </div>
      </div>

      {/* SYSTEM HEALTH MONITOR */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Server size={20} color="#16a34a" />
          <span>Status das Integrações & Banco de Dados</span>
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          
          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>Banco de Dados (PostgreSQL)</span>
              <strong style={{ fontSize: "0.88rem", color: "#16a34a" }}>SUPABASE CONECTADO</strong>
            </div>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>

          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>Apify Lead Finder Engine</span>
              <strong style={{ fontSize: "0.88rem", color: apifyToken ? "#16a34a" : "#ca8a04" }}>
                {apifyToken ? "KEY CONFIGURADA" : "PENDENTE"}
              </strong>
            </div>
            <CheckCircle2 size={20} color={apifyToken ? "#16a34a" : "#ca8a04"} />
          </div>

          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>Google PageSpeed Insights</span>
              <strong style={{ fontSize: "0.88rem", color: pageSpeedKey ? "#16a34a" : "#ca8a04" }}>
                {pageSpeedKey ? "KEY CONFIGURADA" : "PENDENTE"}
              </strong>
            </div>
            <CheckCircle2 size={20} color={pageSpeedKey ? "#16a34a" : "#ca8a04"} />
          </div>

          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>OpenAI Lead Analyst</span>
              <strong style={{ fontSize: "0.88rem", color: openAiKey ? "#16a34a" : "#ca8a04" }}>
                {openAiKey ? "KEY CONFIGURADA" : "PENDENTE"}
              </strong>
            </div>
            <CheckCircle2 size={20} color={openAiKey ? "#16a34a" : "#ca8a04"} />
          </div>

        </div>
      </div>

      {/* API KEYS FORM */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Key size={20} color="#ff6200" />
          <span>Chaves da API (Salvas no Supabase & Navegador):</span>
        </h3>

        <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          
          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block", fontWeight: "600" }}>
              APIFY_API_TOKEN:
            </label>
            <input 
              className="glass-input" 
              type="text" 
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={apifyToken}
              placeholder="apify_api_..."
              onChange={(e) => setApifyToken(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block", fontWeight: "600" }}>
              GOOGLE_PAGESPEED_API_KEY:
            </label>
            <input 
              className="glass-input" 
              type="text" 
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={pageSpeedKey}
              placeholder="AIzaSy..."
              onChange={(e) => setPageSpeedKey(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block", fontWeight: "600" }}>
              OPENAI_API_KEY:
            </label>
            <input 
              className="glass-input" 
              type="password" 
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={openAiKey}
              placeholder="sk-proj-..."
              onChange={(e) => setOpenAiKey(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={saving}
              style={{ padding: "0.65rem 1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saving ? "Salvando no Banco..." : "Salvar no Supabase & Navegador"}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
