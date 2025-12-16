import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api } from './api';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import AdminClients from './pages/AdminClients';
import AdminContracts from './pages/AdminContracts';
import AdminUsers from './pages/AdminUsers';
import PublicDashboard from './pages/PublicDashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoggedLayout from './components/layout/LoggedLayout';

export default function App() {
  const [clients, setClients] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        name: parsed?.name || parsed?.nome || '',
        role: parsed?.role || 'USER',
      };
    } catch (e) {
      localStorage.removeItem('auth_user');
      return null;
    }
  });
  const isAdmin = user?.role === 'ADMIN';
  const [contracts, setContracts] = useState([]);
  const [adminContracts, setAdminContracts] = useState([]);
  const [adminContractFilters, setAdminContractFilters] = useState({});
  const [adminClients, setAdminClients] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/sign-up';

  useEffect(() => {
    if (!error && !info) return;
    const timer = setTimeout(() => {
      setError('');
      setInfo('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, info]);

  const handleLogout = (message = '') => {
    setGlobalLoading(false);
    setLoginLoading(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken('');
    setUser(null);
    setContracts([]);
    setClients([]);
    setAdminContracts([]);
    setAdminClients([]);
    setAdminUsers([]);
    setDashboardSummary(null);
    setInfo('');
    setError(message);
    navigate('/login');
  };

  const handleUnauthorized = (err) => {
    if (err?.status === 401) {
      handleLogout('Sessão expirada. Faça login novamente.');
      return true;
    }
    return false;
  };

  const loadAdminContracts = async (filters = {}) => {
    if (!token) return [];
    const ac = await api.adminContracts(token, filters);
    setAdminContracts(ac);
    return ac;
  };

  const refreshAdminData = async (filters = adminContractFilters) => {
    if (!token || !isAdmin) {
      setAdminContracts([]);
      setAdminClients([]);
      setAdminUsers([]);
      return { ac: [], acl: [] };
    }
    const [ac, acl] = await Promise.all([loadAdminContracts(filters), api.adminClients(token)]);
    setAdminClients(acl);
    const au = await api.adminUsers(token);
    setAdminUsers(au);
    return { ac, acl };
  };

  const handleAdminContractsFilter = async (filters) => {
    setError('');
    setInfo('');
    if (!token) return;
    setGlobalLoading(true);
    try {
      setAdminContractFilters(filters);
      await loadAdminContracts(filters);
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setGlobalLoading(true);
      try {
        const [c, ct] = await Promise.all([api.listClients(token), api.myContracts(token)]);
        setClients(c);
        setContracts(ct);
        if (isAdmin) {
          await Promise.all([loadAdminContracts(adminContractFilters), api.adminClients(token)]);
          const au = await api.adminUsers(token);
          setAdminUsers(au);
        } else {
          setAdminContracts([]);
          setAdminClients([]);
          setAdminUsers([]);
        }
        const summary = await api.dashboardSummary(token);
        setDashboardSummary(summary);
      } catch (err) {
        if (handleUnauthorized(err)) return;
        setError(err.message);
      } finally {
        setGlobalLoading(false);
      }
    };
    load();
  }, [token, isAdmin]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setGlobalLoading(true);
    const data = new FormData(e.currentTarget);
    const payload = {
      nome: (data.get('nome') || '').toString(),
      email: (data.get('email') || '').toString(),
      senha: (data.get('senha') || '').toString(),
    };
    try {
      await api.registerUser(payload);
      // login automático após criar
      const res = await api.login({ email: payload.email, senha: payload.senha });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      const [c, my] = await Promise.all([api.listClients(res.token), api.myContracts(res.token)]);
      setClients(c);
      setContracts(my);
      if (res.user.role === 'ADMIN') {
        setAdminContractFilters({});
        const [acl, au] = await Promise.all([
          api.adminClients(res.token),
          api.adminUsers(res.token),
        ]);
        await loadAdminContracts();
        setAdminClients(acl);
        setAdminUsers(au);
      } else {
        setAdminContracts([]);
        setAdminClients([]);
        setAdminUsers([]);
      }
      const summary = await api.dashboardSummary(res.token);
      setDashboardSummary(summary);
      setInfo('Conta criada e login efetuado.');
      navigate('/dashboard');
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err.message);
    } finally {
        setGlobalLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoginLoading(true);
    setGlobalLoading(true);
    const data = new FormData(e.currentTarget);
    const payload = {
      email: (data.get('email') || '').toString(),
      senha: (data.get('senha') || '').toString(),
    };
    try {
      const res = await api.login(payload);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      const [c, my] = await Promise.all([api.listClients(res.token), api.myContracts(res.token)]);
      setClients(c);
      setContracts(my);
      if (res.user.role === 'ADMIN') {
        setAdminContractFilters({});
        const [acl, au] = await Promise.all([
          api.adminClients(res.token),
          api.adminUsers(res.token),
        ]);
        await loadAdminContracts();
        setAdminClients(acl);
        setAdminUsers(au);
      } else {
        setAdminContracts([]);
        setAdminClients([]);
        setAdminUsers([]);
      }
      const summary = await api.dashboardSummary(res.token);
      setDashboardSummary(summary);
      navigate('/dashboard');
    } catch (err) {
      if (handleUnauthorized(err)) return;
      setError(err.message);
    } finally {
      setLoginLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para cadastrar contratos.');
      return false;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      clienteId: Number(data.get('clienteId')),
      titulo: (data.get('titulo') || '').toString(),
      dataInvestimento: (data.get('dataInvestimento') || '').toString(),
      dataRecebimento: (data.get('dataRecebimento') || '').toString(),
    };
    try {
      await api.createContract(payload, token);
      form.reset();
      if (user) {
        const [c, ct] = await Promise.all([api.listClients(token), api.myContracts(token)]);
        setClients(c);
        setContracts(ct);
        if (isAdmin) {
          const [ac, acl, au] = await Promise.all([
            api.adminContracts(token),
            api.adminClients(token),
            api.adminUsers(token),
          ]);
          setAdminContracts(ac);
          setAdminClients(acl);
          setAdminUsers(au);
        }
        const summary = await api.dashboardSummary(token);
        setDashboardSummary(summary);
      }
      setInfo('Contrato criado.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const form = e.currentTarget;
    if (!token) {
      setError('Faça login para cadastrar clientes.');
      return false;
    }
    const data = new FormData(form);
    const payload = {
      nome: (data.get('nome') || '').toString(),
      sobrenome: (data.get('sobrenome') || '').toString(),
      tipo: (data.get('tipo') || 'INVESTIDOR').toString(),
    };
    try {
      await api.createClient(payload, token);
      form?.reset();
      const [c, ac] = await Promise.all([api.listClients(token), api.adminClients(token)]);
      setClients(c);
      setAdminClients(ac);
      setInfo('Cliente criado.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleUpdateClient = async (clientId, payload) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para editar clientes.');
      return false;
    }
    try {
      await api.adminUpdateClient(clientId, payload, token);
      const [c, ac] = await Promise.all([api.listClients(token), api.adminClients(token)]);
      setClients(c);
      setAdminClients(ac);
      setInfo('Cliente atualizado.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleCreateUser = async (payload) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para cadastrar usuários.');
      return false;
    }
    try {
      await api.registerUser(payload);
      const au = await api.adminUsers(token);
      setAdminUsers(au);
      setInfo('Usuário criado.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleLinkClient = async (clientId, userId) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para vincular clientes.');
      return false;
    }
    try {
      await api.adminLinkClient({ clientId, userId }, token);
      const [ac, au] = await Promise.all([api.adminClients(token), api.adminUsers(token)]);
      setAdminClients(ac);
      setAdminUsers(au);
      setInfo('Cliente vinculado ao usuário.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleLinkClientsToUser = async (userId, clientIds) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para vincular clientes.');
      return false;
    }
    try {
      await api.adminLinkClientsToUser({ userId, clientIds }, token);
      const [ac, au] = await Promise.all([api.adminClients(token), api.adminUsers(token)]);
      setAdminClients(ac);
      setAdminUsers(au);
      setInfo('Clientes vinculados ao usuário.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleEditUser = async (userId, payload) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para editar usuários.');
      return false;
    }
    try {
      const updated = await api.adminUpdateUser(userId, payload, token);
      setAdminUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
      setInfo('Usuário atualizado.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleDeleteUser = async (userId) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para excluir usuários.');
      return false;
    }
    try {
      await api.adminDeleteUser(userId, token);
      setAdminUsers((prev) => prev.filter((user) => user.id !== userId));
      setInfo('Usuário removido.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const renderAdminRoute = (content) => (
    <ProtectedRoute token={token}>
      {user?.role === 'ADMIN' ? (
        <LoggedLayout user={user} onLogout={handleLogout}>
          {content}
        </LoggedLayout>
      ) : (
        <Navigate to="/dashboard" replace />
      )}
    </ProtectedRoute>
  );

  const handleAdminCreateContract = async (payload) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para cadastrar contratos.');
      return false;
    }
    try {
      await api.adminCreateContract(payload, token);
      await refreshAdminData();
      setInfo('Contrato criado (admin).');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleAdminUpdateContract = async (id, payload) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para editar contratos.');
      return false;
    }
    try {
      await api.adminUpdateContract(id, payload, token);
      await refreshAdminData();
      setInfo('Contrato atualizado (admin).');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleAdminDeleteContract = async (id) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para excluir contratos.');
      return false;
    }
    try {
      await api.adminDeleteContract(id, token);
      await refreshAdminData();
      setInfo('Contrato removido.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  const handleAdminDeleteClient = async (ids = []) => {
    setError('');
    setInfo('');
    if (!token) {
      setError('Faça login para excluir clientes.');
      return false;
    }
    if (!ids.length) return false;
    try {
      for (const id of ids) {
        await api.adminDeleteClient(id, token);
      }
      const [c, ac, acl] = await Promise.all([
        api.listClients(token),
        api.adminContracts(token),
        api.adminClients(token),
      ]);
      setClients(c);
      setAdminContracts(ac);
      setAdminClients(acl);
      setInfo(ids.length > 1 ? 'Clientes removidos.' : 'Cliente removido.');
      return true;
    } catch (err) {
      if (handleUnauthorized(err)) return false;
      setError(err.message);
      return false;
    }
  };

  return (
    <div className={isAuthRoute ? 'auth-page' : 'app'}>
      {globalLoading && (
        <div className="loading-overlay" role="status" aria-label="Carregando">
          <div className="loading-logo">
            <img src="/hr logo.png" alt="HR Investimentos" />
          </div>
          <p className="mini muted" style={{ marginTop: '0.75rem' }}>
            Carregando...
          </p>
        </div>
      )}
      {(error || info) && (
        <div className="toast-container">
          {error && <div className="toast error">{error}</div>}
          {info && <div className="toast success">{info}</div>}
        </div>
      )}
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/sign-up"
          element={<SignUp onSubmit={handleRegister} loading={loginLoading} />}
        />
        <Route
          path="/login"
          element={<Login onSubmit={handleLogin} loading={loginLoading} />}
        />
        <Route path="/public/:token" element={<PublicDashboard />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <LoggedLayout user={user} onLogout={handleLogout}>
                <Dashboard
                  clients={clients}
                  contracts={contracts}
                  user={user}
                  summary={dashboardSummary}
                  onLoadSummary={async (clienteId) => {
                    if (!token) return;
                    try {
                      const summary = await api.dashboardSummary(token, clienteId);
                      setDashboardSummary(summary);
                    } catch (err) {
                      if (handleUnauthorized(err)) return;
                      setError(err.message);
                    }
                  }}
                />
              </LoggedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts"
          element={
            <ProtectedRoute token={token}>
              <LoggedLayout user={user} onLogout={handleLogout}>
                <Contracts
                  contracts={contracts}
                  user={user}
                />
              </LoggedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={renderAdminRoute(
            <AdminClients
              clients={adminClients}
              users={adminUsers}
              onCreateClient={handleCreateClient}
              onUpdateClient={handleUpdateClient}
              onLinkClient={handleLinkClient}
              onDeleteClients={handleAdminDeleteClient}
              onShareLink={async (clientId) => {
                try {
                  const res = await api.adminShareToken({ clientId: Number(clientId) }, token);
                  const link = `${window.location.origin}/public/${res.token}`;
                  window.open(link, '_blank', 'noreferrer');
                  setInfo('Link aberto em nova guia.');
                } catch (err) {
                  if (handleUnauthorized(err)) return;
                  setError(err.message);
                }
              }}
            />
          )}
        />
        <Route
          path="/admin/contracts"
          element={renderAdminRoute(
                <AdminContracts
                  clients={adminClients}
                  contracts={adminContracts}
                  onCreateContract={handleAdminCreateContract}
                  onUpdateContract={handleAdminUpdateContract}
                  onDeleteContract={handleAdminDeleteContract}
                  onFilter={handleAdminContractsFilter}
                  user={user}
                />
          )}
        />
        <Route
          path="/admin/users"
          element={renderAdminRoute(
            <AdminUsers
              users={adminUsers}
              clients={adminClients}
              onLinkClientsToUser={handleLinkClientsToUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onCreateUser={handleCreateUser}
            />
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
