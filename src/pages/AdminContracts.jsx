import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function AdminContracts({
  clients,
  contracts,
  onCreateContract,
  onUpdateContract,
  onDeleteContract,
  onFilter,
  user,
}) {
  const [open, setOpen] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [editingContract, setEditingContract] = useState(null);
  const [formKey, setFormKey] = useState('new');
  const [status, setStatus] = useState('ABERTO');
  const [tipo, setTipo] = useState('ATIVO');
  const [produto, setProduto] = useState('PRECATORIO');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [produtoFilter, setProdutoFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  const statusLabels = {
    FINALIZADO: 'Finalizado',
    ABERTO: 'Aberto',
  };
  const tipoLabels = {
    ATIVO: 'Ativo',
    PASSIVO: 'Passivo',
  };
  const produtoLabels = {
    PRECATORIO: 'Precatório',
    RPV: 'RPV',
    CHEQUE: 'Cheque',
    EMPRESTIMO: 'Empréstimo',
  };

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
  ];
  const tipoOptions = [
    { value: '', label: 'Todos os tipos' },
    ...Object.entries(tipoLabels).map(([value, label]) => ({ value, label })),
  ];
  const produtoOptions = [
    { value: '', label: 'Todos os produtos' },
    ...Object.entries(produtoLabels).map(([value, label]) => ({ value, label })),
  ];

  const getContractStatusFromDate = (contract) => {
    if (!contract.dataRecebimento) {
      return 'Aberto';
    }
    const dataRecebimento = new Date(contract.dataRecebimento);
    if (Number.isNaN(dataRecebimento.getTime())) {
      return 'Aberto';
    }
    return dataRecebimento.getTime() < Date.now() ? 'Finalizado' : 'Aberto';
  };

const resolveContractStatus = (contract) =>
  statusLabels[contract.status] || getContractStatusFromDate(contract);

const CONTRACTS_PAGE_SIZE = 10;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cid = params.get('clienteId') || '';
    const openParam = params.get('open');
    if (cid) setClienteId(cid);
    if (openParam === 'true') setOpen(true);
  }, [location.search]);

  const formatCurrency = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const number = Number(digits) / 100;
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrencyInput = (value) => {
    if (!value) return 0;
    const normalized = value.toString().replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
  };

  const latestOnFilter = useRef(onFilter);

  useEffect(() => {
    latestOnFilter.current = onFilter;
  }, [onFilter]);

  useEffect(() => {
    latestOnFilter.current?.({
      status: statusFilter || undefined,
      tipo: tipoFilter || undefined,
      produto: produtoFilter || undefined,
    });
  }, [statusFilter, tipoFilter, produtoFilter]);

  const filteredContracts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contracts;
    return contracts.filter((ctr) => {
      const title = (ctr.titulo || '').toLowerCase();
      const clientName = `${ctr.cliente?.nome || ''} ${ctr.cliente?.sobrenome || ''}`.toLowerCase();
      return title.includes(term) || clientName.includes(term);
    });
  }, [contracts, searchTerm]);

  const totalValor = filteredContracts.reduce((acc, ctr) => acc + Number(ctr.valor || 0), 0);

  const averageRent =
    filteredContracts.length
      ? filteredContracts.reduce((sum, ctr) => sum + Number(ctr.rentabilidade || 0), 0) /
        filteredContracts.length
      : 0;
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / CONTRACTS_PAGE_SIZE));
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tipoFilter, produtoFilter]);

  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * CONTRACTS_PAGE_SIZE;
    return filteredContracts.slice(start, start + CONTRACTS_PAGE_SIZE);
  }, [filteredContracts, currentPage]);

  const pageStart = filteredContracts.length
    ? (currentPage - 1) * CONTRACTS_PAGE_SIZE + 1
    : 0;
  const pageEnd = filteredContracts.length
    ? Math.min(filteredContracts.length, currentPage * CONTRACTS_PAGE_SIZE)
    : 0;
  const hasMultiplePages = totalPages > 1;

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Admin</span>
        <span aria-hidden="true">/</span>
        <span>Contratos</span>
        <span aria-hidden="true">/</span>
        <span className="breadcrumbs-current">Todos os contratos</span>
      </nav>

      <section className="table-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <span className="mini muted">Buscar por contrato ou cliente</span>
            <input
              type="search"
              placeholder="Buscar por contrato ou cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          {filteredContracts.length > 0 && (
            <div className="toolbar-kpis" aria-label="KPIs">
              <div className="kpi-card">
                <span className="kpi-label">Total investido</span>
                <strong className="kpi-value">
                  {totalValor.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Contratos filtrados</span>
                <strong className="kpi-value">{filteredContracts.length}</strong>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Rentabilidade média</span>
                <strong className="kpi-value">{averageRent.toFixed(2)}%</strong>
              </div>
            </div>
          )}
          <div className="toolbar-spacer" aria-hidden="true" />
          <div className="toolbar-actions">
            <button
              type="button"
              onClick={() => {
                setValor('');
                setEditingContract(null);
                setFormKey(`new-${Date.now()}`);
                setStatus('ABERTO');
                setTipo('ATIVO');
                setProduto('PRECATORIO');
                setOpen(true);
              }}
            >
              Novo contrato
            </button>
          </div>
        </div>
        <div className="type-filters full-row" aria-label="Filtros por tipo">
            <div className="filters">
              <span className="mini muted">Status</span>
              <div className="filters-row">
                {statusOptions.map((option) => {
                  const active =
                    option.value === '' ? !statusFilter : statusFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`pill ${active ? 'active' : ''}`}
                      aria-pressed={active}
                      onClick={() => setStatusFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="filters">
              <span className="mini muted">Tipo</span>
              <div className="filters-row">
                {tipoOptions.map((option) => {
                  const active =
                    option.value === '' ? !tipoFilter : tipoFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`pill ${active ? 'active' : ''}`}
                      aria-pressed={active}
                      onClick={() => setTipoFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="filters">
              <span className="mini muted">Produto</span>
              <div className="filters-row">
                {produtoOptions.map((option) => {
                  const active =
                    option.value === '' ? !produtoFilter : produtoFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`pill ${active ? 'active' : ''}`}
                      aria-pressed={active}
                      onClick={() => setProdutoFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contrato</th>
                <th>Investimento</th>
                <th>Recebimento</th>
                <th>Status</th>
                <th>Tipo</th>
                <th>Produto</th>
                <th>Valor</th>
                <th>Rentab.</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContracts.map((ctr) => (
                <tr key={ctr.id}>
                  <td>
                    {ctr.cliente?.nome} {ctr.cliente?.sobrenome || ''}
                  </td>
                  <td>{ctr.titulo}</td>
                  <td>
                    {ctr.dataInvestimento
                      ? new Date(ctr.dataInvestimento).toLocaleDateString('pt-BR', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td>
                    {ctr.dataRecebimento
                      ? new Date(ctr.dataRecebimento).toLocaleDateString('pt-BR', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td>{resolveContractStatus(ctr)}</td>
                  <td>{tipoLabels[ctr.tipo] || '—'}</td>
                  <td>{produtoLabels[ctr.produto] || '—'}</td>
                  <td>
                    {Number(ctr.valor || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td>{Number(ctr.rentabilidade || 0).toFixed(2)}%</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-chip"
                        aria-label="Editar contrato"
                        title="Editar"
                        onClick={() => {
                          setEditingContract(ctr);
                          setClienteId(String(ctr.clienteId));
                          setValor(
                            formatCurrency(
                              Number(ctr.valor || 0)
                                .toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                            ),
                          );
                          setFormKey(`edit-${ctr.id}`);
                          setStatus(ctr.status || 'ABERTO');
                          setTipo(ctr.tipo || 'ATIVO');
                          setProduto(ctr.produto || 'PRECATORIO');
                          setOpen(true);
                        }}
                      >
                        <svg
                          aria-hidden="true"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="icon-chip danger"
                        aria-label="Excluir contrato"
                        title="Excluir"
                        onClick={async () => {
                          const confirmed = window.confirm('Deseja excluir este contrato?');
                          if (!confirmed) return;
                          await onDeleteContract(ctr.id);
                        }}
                      >
                        <svg
                          aria-hidden="true"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredContracts.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    Nenhum contrato cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasMultiplePages && (
          <div className="table-pagination">
            <span className="page-info">
              Exibindo {pageStart}–{pageEnd} de {filteredContracts.length}
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

      {open && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setValor('');
            setEditingContract(null);
            setStatus('ABERTO');
            setTipo('ATIVO');
            setProduto('PRECATORIO');
            setOpen(false);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">{editingContract ? 'Editar contrato' : 'Novo Contrato'}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setValor('');
                  setEditingContract(null);
                  setStatus('ABERTO');
                  setTipo('ATIVO');
                  setProduto('PRECATORIO');
                  setOpen(false);
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <form
              className="form"
              key={formKey}
              onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const payload = {
                  clienteId: Number(data.get('clienteId')),
                  titulo: (data.get('titulo') || '').toString(),
                  valor: parseCurrencyInput(data.get('valor')),
                  rentabilidade: Number(data.get('rentabilidade')),
                  dataInvestimento: (data.get('dataInvestimento') || '').toString(),
                  dataRecebimento: (data.get('dataRecebimento') || '').toString(),
                  arquivoUrl: (data.get('arquivoUrl') || '').toString(),
                  status,
                  tipo,
                  produto,
                };
                const ok = editingContract
                  ? await onUpdateContract(editingContract.id, payload)
                  : await onCreateContract(payload);
                if (ok) {
                  setValor('');
                  setEditingContract(null);
                  setOpen(false);
                  setStatus('ABERTO');
                  setTipo('ATIVO');
                  setProduto('PRECATORIO');
                }
              }}
            >
              <div className="row">
                <label>
                  Cliente
                  <select
                    name="clienteId"
                    required
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} {c.sobrenome}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Título
                  <input
                    name="titulo"
                    placeholder="Título do contrato"
                    required
                    defaultValue={editingContract?.titulo}
                  />
                </label>
              </div>
              <div className="row">
                <label>
                  Data de investimento
                  <input
                    name="dataInvestimento"
                    type="date"
                    required
                    defaultValue={
                      editingContract?.dataInvestimento
                        ? new Date(editingContract.dataInvestimento).toISOString().slice(0, 10)
                        : ''
                    }
                  />
                </label>
                <label>
                  Data de recebimento
                  <input
                    name="dataRecebimento"
                    type="date"
                    required
                    defaultValue={
                      editingContract?.dataRecebimento
                        ? new Date(editingContract.dataRecebimento).toISOString().slice(0, 10)
                        : ''
                    }
                  />
                </label>
              </div>
              <div className="row">
                <label>
                  Valor (R$)
                  <input
                    name="valor"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    required
                    value={valor}
                    onChange={(e) => setValor(formatCurrency(e.target.value))}
                  />
                </label>
                <label>
                  Rentabilidade (%)
                  <input
                    name="rentabilidade"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 8.5"
                    required
                    defaultValue={
                      editingContract ? Number(editingContract.rentabilidade || 0).toFixed(2) : ''
                    }
                  />
                </label>
              </div>
              <div className="row">
                <label>
                  Tipo
                  <select
                    name="tipo"
                    required
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    {Object.entries(tipoLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Produto
                  <select
                    name="produto"
                    required
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                  >
                    {Object.entries(produtoLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Status
                <select
                  name="status"
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
             <label>
                Link do arquivo
                <input
                  name="arquivoUrl"
                  type="url"
                  placeholder="https://..."
                  defaultValue={editingContract?.arquivoUrl || ''}
                />
              </label>
              <button type="submit">
                {editingContract ? 'Atualizar contrato' : 'Salvar contrato'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
