import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminClients({
  clients,
  users,
  onCreateClient,
  onLinkClient,
  onShareLink,
  onDeleteClients,
}) {
  const [open, setOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const navigate = useNavigate();

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) =>
      `${client.nome} ${client.sobrenome}`.toLowerCase().includes(term),
    );
  }, [clients, searchTerm]);

  const sortedClients = useMemo(() => {
    const sorted = [...filteredClients];
    const { key, direction } = sortConfig;
    sorted.sort((a, b) => {
      const aValue = (a[key] ?? '').toString().trim();
      const bValue = (b[key] ?? '').toString().trim();
      const comparison = aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
      return direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredClients, sortConfig]);

  const visibleClientIds = useMemo(() => sortedClients.map((client) => client.id), [
    sortedClients,
  ]);
  const allVisibleSelected =
    visibleClientIds.length > 0 && visibleClientIds.every((id) => selectedIds.includes(id));

  const toggleSelect = (clientId) => {
    setSelectedIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId],
    );
  };

  const toggleAll = (checked) => {
    if (!visibleClientIds.length) {
      setSelectedIds([]);
      return;
    }
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleClientIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !visibleClientIds.includes(id)));
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getAriaSort = (key) => {
    if (sortConfig.key !== key) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length || deleting) return;
    const confirmed = window.confirm(
      selectedIds.length === 1
        ? 'Deseja excluir este cliente?'
        : `Deseja excluir ${selectedIds.length} clientes selecionados?`,
    );
    if (!confirmed) return;
    setDeleting(true);
    const ok = await onDeleteClients?.(selectedIds);
    if (ok) setSelectedIds([]);
    setDeleting(false);
  };

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => clients.some((c) => c.id === id)));
  }, [clients]);

  return (
    <>
      <div className="card">
        <div className="flex-between">
          <h2 className="title">Admin • Clientes</h2>
          <div className="header-actions">
            <span className="badge">{clients.length}</span>
            <button type="button" onClick={() => setOpen(true)} style={{ whiteSpace: 'nowrap' }}>
              Novo cliente
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between">
          <h3 className="title">Clientes cadastrados</h3>
          <div className="header-actions" style={{ gap: '0.5rem' }}>
            {!!selectedIds.length && (
              <span className="badge" aria-label={`${selectedIds.length} selecionado(s)`}>
                {selectedIds.length} selecionado(s)
              </span>
            )}
            <span className="badge">{clients.length}</span>
            <button
              type="button"
              className="pill"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #c0392b)',
                color: '#fff',
                opacity: selectedIds.length && !deleting ? 1 : 0.5,
                cursor: selectedIds.length && !deleting ? 'pointer' : 'not-allowed',
              }}
              disabled={!selectedIds.length || deleting}
              onClick={handleDeleteSelected}
            >
              {deleting ? 'Excluindo...' : 'Excluir selecionados'}
            </button>
          </div>
        </div>
        <div className="table">
          <div className="table-utilities">
            <label className="table-search">
              <span className="mini">Buscar por nome</span>
              <input
                type="search"
                placeholder="Digite nome ou sobrenome"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
            <span className="badge mini">
              {sortedClients.length} de {clients.length} exibidos
            </span>
          </div>
          <div className="table-row head">
            <span>
              <input
                type="checkbox"
                aria-label="Selecionar todos"
                checked={allVisibleSelected}
                onChange={(e) => toggleAll(e.target.checked)}
                disabled={deleting}
              />
            </span>
            <span>
              <button
                type="button"
                className="table-sort-btn"
                onClick={() => handleSort('nome')}
                aria-sort={getAriaSort('nome')}
              >
                Nome
                <span aria-hidden="true" className="sort-indicator">
                  {getSortIndicator('nome')}
                </span>
              </button>
            </span>
            <span>
              <button
                type="button"
                className="table-sort-btn"
                onClick={() => handleSort('sobrenome')}
                aria-sort={getAriaSort('sobrenome')}
              >
                Sobrenome
                <span aria-hidden="true" className="sort-indicator">
                  {getSortIndicator('sobrenome')}
                </span>
              </button>
            </span>
            <span>Ações</span>
          </div>
          {sortedClients.map((c) => (
            <div key={c.id} className="table-row">
              <span>
                <input
                  type="checkbox"
                  aria-label={`Selecionar ${c.nome}`}
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleSelect(c.id)}
                  disabled={deleting}
                />
              </span>
              <span>{c.nome}</span>
              <span>{c.sobrenome}</span>
              <span>
                <div className="table-actions">
                  <button
                    type="button"
                    className="pill"
                    onClick={() => navigate(`/admin/contracts?clienteId=${c.id}&open=true`)}
                  >
                    Adicionar contrato
                  </button>
                  <button
                    type="button"
                    className="pill"
                    onClick={() => {
                      setSelectedClient(c);
                      setLinkOpen(true);
                    }}
                  >
                    Vincular usuário
                  </button>
                  <button
                    type="button"
                    className="pill"
                    onClick={() => onShareLink?.(c.id)}
                  >
                    Abrir link
                  </button>
                </div>
              </span>
            </div>
          ))}
          {!sortedClients.length && (
            <div className="table-row">
              <span colSpan={4} className="mini">
                Nenhum cliente cadastrado.
              </span>
            </div>
          )}
        </div>
      </div>

      {linkOpen && (
        <div className="modal-backdrop" onClick={() => setLinkOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">Vincular cliente a usuário</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setLinkOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <form
              className="form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedClient || !selectedUserId) return;
                const ok = await onLinkClient(selectedClient.id, Number(selectedUserId));
                if (ok) {
                  setSelectedUserId('');
                  setSelectedClient(null);
                  setLinkOpen(false);
                }
              }}
            >
              <p className="muted">
                Cliente: <strong>{selectedClient?.nome} {selectedClient?.sobrenome}</strong>
              </p>
              <label>
                Usuário
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Selecione um usuário</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email} ({u.email})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Vincular</button>
            </form>
          </div>
        </div>
      )}

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">Novo Cliente</h3>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>
            <form
              className="form"
              onSubmit={async (e) => {
                const ok = await onCreateClient(e);
                if (ok) setOpen(false);
              }}
            >
              <div className="row">
                <label>
                  Nome
                  <input name="nome" placeholder="Nome" required />
                </label>
                <label>
                  Sobrenome
                  <input name="sobrenome" placeholder="Sobrenome" required />
                </label>
              </div>
              <button type="submit">Salvar cliente</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
