import React, { useEffect, useMemo, useState } from 'react';

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  USER: 'Usuário',
};

export default function AdminUsers({
  users = [],
  clients = [],
  onLinkClientsToUser,
  onEditUser,
  onDeleteUser,
  onCreateUser,
}) {
  const [openUserId, setOpenUserId] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', email: '', role: 'USER' });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createValues, setCreateValues] = useState({ nome: '', email: '', senha: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalSortConfig, setModalSortConfig] = useState({ key: 'nome', direction: 'asc' });

  useEffect(() => {
    if (!editingUser) return;
    setEditValues({
      name: editingUser.name || '',
      email: editingUser.email || '',
      role: editingUser.role || 'USER',
    });
  }, [editingUser]);

  useEffect(() => {
    if (!openUserId) {
      setSelectedClients([]);
      setModalSearchTerm('');
      setModalSortConfig({ key: 'nome', direction: 'asc' });
      return;
    }
    const user = users.find((u) => u.id === openUserId);
    const linkedIds =
      user?.clientLinks
        ?.map((link) => link.client?.id ?? link.clientId)
        .filter(Boolean) ?? [];
    setSelectedClients(linkedIds);
  }, [openUserId, users]);

  const filteredClients = useMemo(() => {
    const term = modalSearchTerm.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) => {
      const fullName = `${client.nome} ${client.sobrenome}`.toLowerCase();
      const documento = (client.documento || '').toLowerCase();
      return fullName.includes(term) || documento.includes(term);
    });
  }, [clients, modalSearchTerm]);

  const sortedClients = useMemo(() => {
    const toCompare = {
      nome: (client) => (client.nome || '').trim(),
      sobrenome: (client) => (client.sobrenome || '').trim(),
      documento: (client) => (client.documento || '').trim(),
    };
    const sorted = [...filteredClients];
    const { key, direction } = modalSortConfig;
    sorted.sort((a, b) => {
      const aValue = toCompare[key](a).toLowerCase();
      const bValue = toCompare[key](b).toLowerCase();
      const comparison = aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
      return direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredClients, modalSortConfig]);

  const handleModalSort = (key) => {
    setModalSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getModalSortIndicator = (key) => {
    if (modalSortConfig.key !== key) return '↕';
    return modalSortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getModalAriaSort = (key) => {
    if (modalSortConfig.key !== key) return 'none';
    return modalSortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  const toggleClient = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId],
    );
  };

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString('pt-BR', {
          month: 'short',
          year: 'numeric',
        })
      : '—';

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingUser) return;
    const ok = await onEditUser?.(editingUser.id, editValues);
    if (ok) {
      setEditingUser(null);
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (creatingUser || !onCreateUser) return;
    setCreatingUser(true);
    const payload = {
      nome: createValues.nome.trim(),
      email: createValues.email.trim(),
      senha: createValues.senha,
    };
    const ok = await onCreateUser(payload);
    setCreatingUser(false);
    if (ok) {
      setCreateValues({ nome: '', email: '', senha: '' });
      setCreateModalOpen(false);
    }
  };

  return (
    <>
      <div className="card">
        <div className="flex-between">
          <h2 className="title">Admin • Usuários</h2>
          <div className="header-actions">
            <span className="badge">Admin</span>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              style={{ whiteSpace: 'nowrap' }}
            >
              Novo usuário
            </button>
          </div>
        </div>
        <div className="table" style={{ marginTop: '0.75rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Role</th>
                <th>Clientes</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || '—'}</td>
                  <td>{user.email}</td>
                  <td>{ROLE_LABELS[user.role] || user.role}</td>
                  <td>{user._count?.clientLinks ?? 0}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="pill"
                        onClick={() => {
                          setOpenUserId(user.id);
                        }}
                      >
                        Vincular clientes
                      </button>
                      <button
                        type="button"
                        className="pill"
                        onClick={() => {
                          setEditingUser(user);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="pill danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja remover o usuário "${user.name || user.email}"? Esta ação não pode ser desfeita.`,
                            )
                          ) {
                            onDeleteUser?.(user.id);
                          }
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={6} className="mini">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">Novo usuário</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setCreateModalOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <form className="form" onSubmit={handleCreateSubmit}>
              <label>
                Nome
                <input
                  type="text"
                  value={createValues.nome}
                  onChange={(e) => setCreateValues((prev) => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={createValues.email}
                  onChange={(e) => setCreateValues((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <label>
                Senha
                <input
                  type="password"
                  value={createValues.senha}
                  onChange={(e) => setCreateValues((prev) => ({ ...prev, senha: e.target.value }))}
                  required
                />
              </label>
              <button type="submit" disabled={creatingUser}>
                {creatingUser ? 'Criando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {openUserId && (
        <div className="modal-backdrop" onClick={() => setOpenUserId(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">Vincular clientes</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpenUserId(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <form
              className="form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedClients.length) return;
                const ok = await onLinkClientsToUser(openUserId, selectedClients);
                if (ok) {
                  setSelectedClients([]);
                  setOpenUserId(null);
                }
              }}
            >
              <div className="table" style={{ maxHeight: '420px', overflow: 'auto' }}>
                <div className="table-utilities">
                  <label className="table-search">
                    <span className="mini">Buscar cliente</span>
                    <input
                      type="search"
                      placeholder="Digite nome, sobrenome ou documento"
                      value={modalSearchTerm}
                      onChange={(e) => setModalSearchTerm(e.target.value)}
                    />
                  </label>
                  <span className="badge mini">
                    {sortedClients.length} de {clients.length} disponíveis
                  </span>
                </div>
                <div className="table-row head">
                  <span />
                  <span>
                    <button
                      type="button"
                      className="table-sort-btn"
                      onClick={() => handleModalSort('nome')}
                      aria-sort={getModalAriaSort('nome')}
                    >
                      Nome
                      <span aria-hidden="true" className="sort-indicator">
                        {getModalSortIndicator('nome')}
                      </span>
                    </button>
                  </span>
                  <span>
                    <button
                      type="button"
                      className="table-sort-btn"
                      onClick={() => handleModalSort('documento')}
                      aria-sort={getModalAriaSort('documento')}
                    >
                      Documento
                      <span aria-hidden="true" className="sort-indicator">
                        {getModalSortIndicator('documento')}
                      </span>
                    </button>
                  </span>
                </div>
                {sortedClients.map((client) => (
                  <label key={client.id} className="table-row" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => toggleClient(client.id)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>
                      {client.nome} {client.sobrenome}
                    </span>
                    <span>{client.documento}</span>
                  </label>
                ))}
                {!sortedClients.length && (
                  <div className="table-row">
                    <span colSpan={3}>Nenhum cliente cadastrado.</span>
                  </div>
                )}
              </div>
              <button type="submit" disabled={!selectedClients.length}>
                Salvar vínculos
              </button>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">Editar usuário</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditingUser(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <form className="form" onSubmit={handleEditSubmit}>
              <label>
                Nome
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={editValues.email}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
              <label>
                Role
                <select
                  value={editValues.role}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, role: e.target.value }))}
                  required
                >
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
              <button type="submit">Salvar alterações</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
