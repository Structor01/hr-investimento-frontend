import React from 'react';
import { Link } from 'react-router-dom';

export default function LoggedLayout({ user, onLogout, children }) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="badge">Área logada</div>
          <p className="muted mini">{user?.email}</p>
        </div>
        <div className="sidebar-links">
          <div className="sidebar-group">
            <p className="sidebar-group-title">Geral</p>
            <Link to="/dashboard">Painel</Link>
            <Link to="/contracts">Contratos</Link>
          </div>
          {isAdmin && (
            <div className="sidebar-group">
              <p className="sidebar-group-title">Admin</p>
              <Link to="/admin/clients">Clientes</Link>
              <Link to="/admin/contracts">Contratos</Link>
              <Link to="/admin/users">Usuários</Link>
            </div>
          )}
        </div>
        <button className="ghost" type="button" onClick={onLogout}>
          Sair
        </button>
      </aside>
      <div className="layout-content">{children}</div>
    </div>
  );
}
