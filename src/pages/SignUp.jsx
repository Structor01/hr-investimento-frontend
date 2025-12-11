import React from 'react';
import { Link } from 'react-router-dom';

export default function SignUp({ onSubmit, loading }) {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-head">
          <img src="/hr logo.png" alt="HR Investimentos" className="logo-img" />
          <div>
            <p className="mini muted">HR Investimentos</p>
            <h2 className="title">Abrir conta</h2>
            <p className="muted">Cadastre-se para acessar e assinar contratos.</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={onSubmit} autoComplete="off">
          <label>
            Nome completo
            <input name="nome" placeholder="Seu nome" required />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="seu@email.com" required />
          </label>
          <label>
            Senha
            <input name="senha" type="password" placeholder="••••••••" required />
          </label>
          <button type="submit" disabled={loading}>
            Criar conta
          </button>
          <p className="subtext">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
