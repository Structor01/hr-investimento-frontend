import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const GENERAL_LINKS = [
  { to: '/dashboard', label: 'Painel' },
  { to: '/contracts', label: 'Contratos' },
];

const ADMIN_LINKS = [
  { to: '/admin/clients', label: 'Cadastros' },
  { to: '/admin/contracts', label: 'Contratos' },
  { to: '/admin/users', label: 'Usuários' },
];

export default function LoggedLayout({ user, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const profileInitial =
    user?.name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    'U';

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  return (
    <div className="layout-shell">
      <header className="app-header">
        <Link to="/dashboard" className="logo">
          <img src="/hr logo.png" alt="HR Investimentos" className="logo-img header-logo-img" />
          <div>
            <strong>HR Investimentos</strong>
            <p className="mini">Portal administrativo</p>
          </div>
        </Link>
        <nav className="header-nav" aria-label="Menu principal">
          <div className="nav-group">
            <span className="nav-group-label">Geral</span>
            <div className="nav-links">
              {GENERAL_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          {isAdmin && (
            <div className="nav-group">
              <span className="nav-group-label">Admin</span>
              <div className="nav-links">
                {ADMIN_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
        <div className="header-actions">
          <div className="profile-menu-wrapper" ref={menuRef}>
            <button
              type="button"
              className="profile-toggle"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-controls="profile-menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="profile-icon" aria-hidden="true">
                {profileInitial}
              </span>
              <span className="profile-toggle-label mini">Perfil</span>
            </button>
            {menuOpen && (
              <div className="profile-menu" id="profile-menu">
                <div>
                  <strong className="profile-name">{user?.name || 'Usuário'}</strong>
                  <p className="profile-email mini muted">{user?.email}</p>
                </div>
                {isAdmin && <span className="badge mini profile-badge">Admin</span>}
                <button
                  type="button"
                  className="ghost profile-logout"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="layout-content">{children}</div>
    </div>
  );
}
