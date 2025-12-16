import React, { useState, useEffect } from 'react';
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
  const location = useLocation();
  const totalValor = contracts.reduce((acc, ctr) => acc + Number(ctr.valor || 0), 0);

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
  };

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

  const applyFilters = () => {
    onFilter?.({
      status: statusFilter || undefined,
      tipo: tipoFilter || undefined,
      produto: produtoFilter || undefined,
    });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setTipoFilter('');
    setProdutoFilter('');
    onFilter?.({});
  };

  return (
    <>
      <div className="card">
        <div className="flex-between">
          <h2 className="title">Admin • Contratos</h2>
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

      <div className="card">
        <div className="flex-between">
          <h3 className="title">Todos os contratos</h3>
          <span className="badge">Admin</span>
        </div>
        <div className="filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos os status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
            <option value="">Todos os tipos</option>
            {Object.entries(tipoLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select value={produtoFilter} onChange={(e) => setProdutoFilter(e.target.value)}>
            <option value="">Todos os produtos</option>
            {Object.entries(produtoLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="button" onClick={applyFilters}>
            Filtrar
          </button>
          <button type="button" onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>
        <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
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
              {contracts.map((ctr) => (
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
              {!contracts.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    Nenhum contrato cadastrado.
                  </td>
                </tr>
              )}
              {!!contracts.length && (
                <tr className="total">
                  <td>Total</td>
                  <td>{contracts.length} contratos</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>
                    {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td>—</td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
