import React from 'react';

const formatMonthYear = (value) =>
  value
    ? new Date(value).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
    : '—';

const formatClientName = (cliente) => {
  if (!cliente) return '—';
  const parts = [cliente.nome, cliente.sobrenome].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
};

export default function Contracts({ contracts, user }) {
  const totalValor = contracts.reduce((acc, ctr) => acc + Number(ctr.valor || 0), 0);
  return (
    <>
      <div className="card">
        <div className="flex-between">
          <h2 className="title">Meus Contratos</h2>
          <span className="badge">Tabela</span>
        </div>
        <p className="muted mini">Contratos de {user?.name || '...'}</p>
        <div className="table contracts-table" style={{ marginTop: '0.75rem' }}>
          <div className="table-row head">
            <span>Cliente</span>
            <span>Contrato</span>
            <span>Investimento</span>
            <span>Recebimento</span>
            <span>Valor</span>
            <span>Rentab.</span>
          </div>
          {contracts.map((ctr) => (
            <div key={ctr.id} className="table-row">
              <span>{formatClientName(ctr.cliente)}</span>
              <span>{ctr.titulo}</span>
              <span>
                {formatMonthYear(ctr.dataInvestimento)}
              </span>
              <span>
                {formatMonthYear(ctr.dataRecebimento)}
              </span>
              <span>
                {Number(ctr.valor || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
              <span>{Number(ctr.rentabilidade || 0).toFixed(2)}%</span>
            </div>
          ))}
          {!contracts.length && (
            <div className="table-row">
              <span colSpan={6}>Nenhum contrato ainda.</span>
            </div>
          )}
          {!!contracts.length && (
            <div className="table-row total">
              <span>Total</span>
              <span>{contracts.length} contratos</span>
              <span>—</span>
              <span>—</span>
              <span>
                {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span>—</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
