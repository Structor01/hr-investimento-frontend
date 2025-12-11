import React from 'react';

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
        <div className="table" style={{ marginTop: '0.75rem' }}>
          <div className="table-row head">
            <span>Contrato</span>
            <span>Investimento</span>
            <span>Recebimento</span>
            <span>Valor</span>
            <span>Rentab.</span>
          </div>
          {contracts.map((ctr) => (
            <div key={ctr.id} className="table-row">
              <span>{ctr.titulo}</span>
              <span>
                {ctr.dataInvestimento
                  ? new Date(ctr.dataInvestimento).toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
              <span>
                {ctr.dataRecebimento
                  ? new Date(ctr.dataRecebimento).toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
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
              <span colSpan={5}>Nenhum contrato ainda.</span>
            </div>
          )}
          {!!contracts.length && (
            <div className="table-row total">
              <span>Total</span>
              <span>{contracts.length} contratos</span>
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
