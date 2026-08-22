import React, { useState } from "react";
import { X, Lock, Mail, User, ShieldCheck, Building, Key } from "lucide-react";

export default function AuthModal({ isOpen, onClose, currentUser, onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("alexandre@growthhunter.io");
  const [password, setPassword] = useState("••••••••");
  const [name, setName] = useState("Alexandre Sales");
  const [orgName, setOrgName] = useState("GrowthHunter Marketing SaaS");
  const [role, setRole] = useState("OWNER");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      onRegister({ email, name, orgName, role });
    } else {
      onLogin({ email, name, role });
    }
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
        maxWidth: "480px",
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
            <div style={{ background: "#fff7ed", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ffedd5" }}>
              <Lock size={20} color="#ff6200" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "900", color: "#1c1917", margin: 0 }}>
                {isRegister ? "Criar Conta & Organização Multi-Tenant" : "Autenticação GrowthHunter"}
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#78716c" }}>
                Acesso seguro com isolamento de tenant
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                  Nome da Organização (Empresa SaaS):
                </label>
                <input 
                  className="glass-input"
                  type="text"
                  required
                  style={{ width: "100%" }}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                  Nome Completo do Usuário:
                </label>
                <input 
                  className="glass-input"
                  type="text"
                  required
                  style={{ width: "100%" }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              E-mail Comercial:
            </label>
            <input 
              className="glass-input"
              type="email"
              required
              style={{ width: "100%" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              Senha de Acesso:
            </label>
            <input 
              className="glass-input"
              type="password"
              required
              style={{ width: "100%" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              Papel / Permissão (RBAC Role):
            </label>
            <select 
              className="glass-select"
              style={{ width: "100%" }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="OWNER">OWNER (Dono da Organização - Acesso Total)</option>
              <option value="ADMIN">ADMIN (Administrador do Sistema)</option>
              <option value="MANAGER">MANAGER (Gestor de Equipe & Campanhas)</option>
              <option value="SALES">SALES (Vendedor / Operador WhatsApp)</option>
              <option value="ANALYST">ANALYST (Analista de Inteligência - Leitura)</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <button 
              type="button" 
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: "none", border: "none", color: "#ff6200", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
            >
              {isRegister ? "Já possui uma conta? Entrar" : "Criar nova organização SaaS"}
            </button>

            <button type="submit" className="btn-primary">
              <ShieldCheck size={16} />
              <span>{isRegister ? "Registrar Tenant" : "Acessar CRM"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
