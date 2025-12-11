import React from 'react';
import { Link } from 'react-router-dom';

export default function Login({ onSubmit, loading }) {
  const version = import.meta.env.VITE_APP_VERSION || 'v1.0.1';

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-head">
          <img src="/hr logo.png" alt="HR Investimentos" className="logo-img" />
          <div>
            <p className="mini muted">HR Investimentos</p>
            <h2 className="title">Bem-vindo de volta</h2>
            <p className="muted">Entre para acessar contratos e assinaturas.</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={onSubmit} autoComplete="off">
          <label>
            Email
            <input name="email" type="email" placeholder="seu@email.com" required />
          </label>
          <label>
            Senha
            <input name="senha" type="password" placeholder="••••••••" required />
          </label>
          <div className="remember-row">
            <span className="mini">Use as credenciais cadastradas.</span>
            <Link className="mini" to="/sign-up">
              Abrir conta
            </Link>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="mini muted" style={{ textAlign: 'center', marginTop: '8px' }}>
            Versão {version}
          </p>
          <p className="subtext">
            Ainda não tem conta? <Link to="/sign-up">Crie agora</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
