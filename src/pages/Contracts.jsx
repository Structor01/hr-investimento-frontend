import React, { useMemo, useState } from 'react';

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

const formatClientName = (cliente) => {
  if (!cliente) return '—';
  const parts = [cliente.nome, cliente.sobrenome].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
};

export default function Contracts({ contracts, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [produtoFilter, setProdutoFilter] = useState('');

  const filteredContracts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return contracts.filter((ctr) => {
      const title = (ctr.titulo || '').toLowerCase();
      const clienteName = `${ctr.cliente?.nome || ''} ${ctr.cliente?.sobrenome || ''}`.trim().toLowerCase();
      const matchesTerm =
        !term || title.includes(term) || clienteName.includes(term);
      const matchesStatus = !statusFilter || ctr.status === statusFilter;
      const matchesTipo = !tipoFilter || ctr.tipo === tipoFilter;
      const matchesProduto = !produtoFilter || ctr.produto === produtoFilter;
      return matchesTerm && matchesStatus && matchesTipo && matchesProduto;
    });
  }, [contracts, searchTerm, statusFilter, tipoFilter, produtoFilter]);

  const totalValor = filteredContracts.reduce((acc, ctr) => acc + Number(ctr.valor || 0), 0);
  const averageRent =
    filteredContracts.length
      ? filteredContracts.reduce((sum, ctr) => sum + Number(ctr.rentabilidade || 0), 0) /
        filteredContracts.length
      : 0;

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Contratos</span>
        <span aria-hidden="true">/</span>
        <span className="breadcrumbs-current">Minhas aplicações</span>
      </nav>

      <section className="table-panel">
        <div className="table-toolbar contracts-toolbar">
          <label className="table-search">
            <span className="mini muted">Buscar por contrato ou cliente</span>
            <input
              type="search"
              placeholder="Buscar por contrato ou cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <div className="toolbar-kpis" aria-label="KPIs">
            <div className="kpi-card">
              <span className="kpi-label">Total investido</span>
              <strong className="kpi-value">
                {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Contratos</span>
              <strong className="kpi-value">{filteredContracts.length}</strong>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Rentabilidade média</span>
              <strong className="kpi-value">{averageRent.toFixed(2)}%</strong>
            </div>
          </div>
          <div className="toolbar-actions">
            <span className="mini muted">{user?.name ? `Cliente: ${user.name}` : 'Sem cliente'}</span>
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
                const active = option.value === '' ? !tipoFilter : tipoFilter === option.value;
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
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((ctr) => (
                <tr key={ctr.id}>
                  <td>{formatClientName(ctr.cliente)}</td>
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
                </tr>
              ))}
              {!filteredContracts.length && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center' }}>
                    Nenhum contrato encontrado.
                  </td>
                </tr>
              )}
              {!!filteredContracts.length && (
                <tr className="total">
                  <td>Total</td>
                  <td>{filteredContracts.length} contratos</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>
                    {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td>—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
