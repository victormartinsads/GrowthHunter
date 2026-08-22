import React, { useState } from "react";
import { Server, CheckCircle2, AlertTriangle, ShieldCheck, Activity, Database, Lock } from "lucide-react";

export default function SystemHealthView() {
  const [logs] = useState([
    { id: 1, action: "USER_LOGIN", user: "Alexandre Sales (OWNER)", tenant: "GrowthHunter SaaS", timestamp: new Date().toLocaleTimeString() },
    { id: 2, action: "APIFY_CAMPAIGN_RUN", user: "Alexandre Sales", tenant: "GrowthHunter SaaS", timestamp: new Date(Date.now() - 300000).toLocaleTimeString() },
    { id: 3, action: "LEADS_DEDUPLICATED", user: "System Worker", tenant: "GrowthHunter SaaS", timestamp: new Date(Date.now() - 280000).toLocaleTimeString() },
    { id: 4, action: "PIPELINE_CHANGED", user: "Alexandre Sales", tenant: "GrowthHunter SaaS", timestamp: new Date(Date.now() - 120000).toLocaleTimeString() }
  ]);

  const services = [
    { name: "PostgreSQL Database Engine", status: "HEALTHY", detail: "Active Pool Connection" },
    { name: "Redis & BullMQ Queues", status: "HEALTHY", detail: "0 Workers Lag" },
    { name: "Apify Maps Crawler", status: "HEALTHY", detail: "API v2 Ready" },
    { name: "Google PageSpeed Insights", status: "HEALTHY", detail: "Quota OK" },
    { name: "AI Lead Analyst & Sales Copilot", status: "HEALTHY", detail: "Provider Connected" },
    { name: "WhatsApp Business Webhooks", status: "NOT_CONFIGURED", detail: "Aguardando Token" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* HEADER BANNER */}
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
            <Activity size={26} color="#ff6200" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
              🖥️ SYSTEM HEALTH & AUDIT LOGS DA APLICAÇÃO
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
            Monitoramento de serviços background, latência de filas Redis, integradores e log de auditoria multi-tenant.
          </p>
        </div>
      </div>

      {/* SYSTEM SERVICES HEALTH */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1.25rem" }}>
          Status dos Serviços e Trabalhadores (Workers):
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {services.map((s, idx) => (
            <div key={idx} style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: "0.88rem", color: "#1c1917", display: "block" }}>{s.name}</strong>
                <span style={{ fontSize: "0.75rem", color: "#78716c" }}>{s.detail}</span>
              </div>
              <span className="badge" style={{
                background: s.status === "HEALTHY" ? "#f0fdf4" : "#fff7ed",
                color: s.status === "HEALTHY" ? "#16a34a" : "#ea580c",
                border: s.status === "HEALTHY" ? "1px solid #bbf7d0" : "1px solid #ffedd5"
              }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AUDIT LOGS TABLE */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1rem" }}>
          Logs de Auditoria Multi-Tenant (`audit_logs`):
        </h3>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "#faf9f6", borderBottom: "1px solid #e8e6e0" }}>
              <th style={{ padding: "0.75rem", color: "#78716c" }}>Ação Executada</th>
              <th style={{ padding: "0.75rem", color: "#78716c" }}>Usuário</th>
              <th style={{ padding: "0.75rem", color: "#78716c" }}>Organização Tenant</th>
              <th style={{ padding: "0.75rem", color: "#78716c", textAlign: "right" }}>Horário</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: "1px solid #e8e6e0" }}>
                <td style={{ padding: "0.75rem", fontWeight: "700", color: "#ff6200" }}>{log.action}</td>
                <td style={{ padding: "0.75rem", color: "#1c1917" }}>{log.user}</td>
                <td style={{ padding: "0.75rem", color: "#57534e" }}>{log.tenant}</td>
                <td style={{ padding: "0.75rem", color: "#78716c", textAlign: "right" }}>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
