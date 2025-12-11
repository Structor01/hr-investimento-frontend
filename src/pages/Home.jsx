import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ token }) {
  return (
    <div className="card">
      <div className="flex-between">
        <h2 className="title">HR Investimentos • Corretora</h2>
        <span className="badge">Portal do cliente</span>
      </div>
      <p className="muted">
        Abra conta, faça login e acesse seu painel de contratos e assinaturas de forma segura.
      </p>
      <div className="row">
        <Link className="pill active" to="/sign-up">
          Abrir conta (Sign-up)
        </Link>
        {token ? (
          <Link className="pill" to="/dashboard">
            Ir para Dashboard
          </Link>
        ) : (
          <Link className="pill" to="/login">
            Já tenho conta (Login)
          </Link>
        )}
      </div>
    </div>
  );
}
