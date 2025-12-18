import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddContractIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const LinkUserIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3h7v7" />
    <path d="M10 14L21 3" />
    <path d="M21 3l-9 9" />
    <path d="M5 5h7" />
    <path d="M5 5v14" />
    <path d="M5 19h14" />
  </svg>
);

const EditClientIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const CLIENT_TYPE_FILTERS = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'INVESTIDOR', label: 'Investidor' },
  { value: 'ESCRITORIO', label: 'Escritório' },
];

const CLIENTS_PAGE_SIZE = 10;

export default function AdminClients({
  clients,
  users,
  onCreateClient,
  onLinkClient,
  onShareLink,
  onUpdateClient,
}) {
  const [open, setOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const navigate = useNavigate();
  const [clientType, setClientType] = useState('INVESTIDOR');
  const [filterType, setFilterType] = useState('TODOS');
  const [editingClient, setEditingClient] = useState(null);
  const [clientFormKey, setClientFormKey] = useState('client-form');
  const [currentPage, setCurrentPage] = useState(1);

  const resetClientFormState = () => {
    setEditingClient(null);
    setClientType('INVESTIDOR');
    setClientFormKey(`client-form-${Date.now()}`);
  };

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return clients.filter((client) => {
      const matchesTerm = !term
        ? true
        : `${client.nome} ${client.sobrenome}`.toLowerCase().includes(term);
      const typeValue = (client.tipo || 'INVESTIDOR').toString();
      const matchesType = filterType === 'TODOS' || typeValue === filterType;
      return matchesTerm && matchesType;
    });
  }, [clients, searchTerm, filterType]);

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

  const totalPages = Math.max(1, Math.ceil(sortedClients.length / CLIENTS_PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((prev) => (prev > totalPages ? totalPages : prev));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * CLIENTS_PAGE_SIZE;
    return sortedClients.slice(start, start + CLIENTS_PAGE_SIZE);
  }, [sortedClients, currentPage]);

  const hasMultiplePages = totalPages > 1;
  const pageStart = sortedClients.length
    ? (currentPage - 1) * CLIENTS_PAGE_SIZE + 1
    : 0;
  const pageEnd = sortedClients.length
    ? Math.min(sortedClients.length, currentPage * CLIENTS_PAGE_SIZE)
    : 0;

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

  const openClientForm = () => {
    setEditingClient(null);
    setClientType('INVESTIDOR');
    setClientFormKey(`client-form-${Date.now()}`);
    setOpen(true);
  };

  const handleClientFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      nome: (data.get('nome') || '').toString(),
      sobrenome: (data.get('sobrenome') || '').toString(),
      tipo: (data.get('tipo') || 'INVESTIDOR').toString(),
    };
    if (editingClient) {
      const ok = await onUpdateClient?.(editingClient.id, payload);
      if (ok) {
        resetClientFormState();
        form.reset();
        setOpen(false);
      }
      return;
    }
    const ok = await onCreateClient(e);
    if (ok) {
      resetClientFormState();
      setOpen(false);
    }
  };

  const clientTypeLabels = {
    INVESTIDOR: 'Investidor',
    ESCRITORIO: 'Escritório',
  };

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Admin</span>
        <span aria-hidden="true">/</span>
        <span>Cadastros</span>
        <span aria-hidden="true">/</span>
        <span className="breadcrumbs-current">Clientes</span>
      </nav>

      <section className="table-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <span className="mini">Buscar por nome</span>
            <input
              type="search"
              placeholder="Digite nome ou sobrenome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <div className="type-filters" aria-label="Filtros por tipo">
            {CLIENT_TYPE_FILTERS.map((item) => (
              <button
                type="button"
                key={item.value}
                className={`pill ${filterType === item.value ? 'active' : ''}`}
                aria-pressed={filterType === item.value}
                onClick={() => setFilterType(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <button type="button" onClick={openClientForm} style={{ whiteSpace: 'nowrap' }}>
              Novo cadastro
            </button>
          </div>
        </div>
        <div className="table">
          <div className="table-row head">
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
            <span>Tipo</span>
            <span>Ações</span>
          </div>
          {paginatedClients.map((c) => (
            <div key={c.id} className="table-row">
              <span>{c.nome}</span>
              <span>{c.sobrenome}</span>
              <span>{clientTypeLabels[c.tipo] || clientTypeLabels.INVESTIDOR}</span>
              <span>
                <div className="table-actions">
                  <button
                    type="button"
                    className="icon-chip"
                    aria-label="Editar cliente"
                    data-tooltip="Editar cliente"
                    onClick={() => {
                      setEditingClient(c);
                      setClientType(c.tipo || 'INVESTIDOR');
                      setClientFormKey(`client-form-edit-${c.id}-${Date.now()}`);
                      setOpen(true);
                    }}
                  >
                    <EditClientIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-chip"
                    aria-label="Adicionar contrato"
                    data-tooltip="Adicionar contrato"
                    onClick={() => navigate(`/admin/contracts?clienteId=${c.id}&open=true`)}
                  >
                    <AddContractIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-chip"
                    aria-label="Vincular usuário"
                    data-tooltip="Vincular usuário"
                    onClick={() => {
                      setSelectedClient(c);
                      setLinkOpen(true);
                    }}
                  >
                    <LinkUserIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-chip"
                    aria-label="Abrir link público"
                    data-tooltip="Abrir link público"
                    onClick={() => onShareLink?.(c.id)}
                  >
                    <ExternalLinkIcon />
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
        {hasMultiplePages && (
          <div className="table-pagination">
            <span className="page-info">
              Exibindo {pageStart}–{pageEnd} de {sortedClients.length}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="pill"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                className="pill"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </section>

      {linkOpen && (
        <div className="modal-backdrop" onClick={() => setLinkOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">Vincular cliente a usuário</h3>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => {
                      setLinkOpen(false);
                    }}
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
        <div
          className="modal-backdrop"
          onClick={() => {
            resetClientFormState();
            setOpen(false);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">{editingClient ? 'Editar cadastro' : 'Novo Cadastro'}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  resetClientFormState();
                  setOpen(false);
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <form className="form" key={clientFormKey} onSubmit={handleClientFormSubmit}>
              <div className="row">
                <label>
                  Nome
                  <input
                    name="nome"
                    placeholder="Nome"
                    required
                    defaultValue={editingClient?.nome || ''}
                  />
                </label>
                <label>
                  Sobrenome
                  <input
                    name="sobrenome"
                    placeholder="Sobrenome"
                    required
                    defaultValue={editingClient?.sobrenome || ''}
                  />
                </label>
                <label>
                  Tipo
                  <select
                    name="tipo"
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                  >
                    {Object.entries(clientTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="submit">
                {editingClient ? 'Salvar alterações' : 'Salvar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
