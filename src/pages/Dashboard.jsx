import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

export default function Dashboard({ contracts, user, clients, summary, onLoadSummary }) {
  const STORAGE_KEY = 'dashboard_cliente';
  const [clienteSelecionado, setClienteSelecionado] = useState(
    () => localStorage.getItem(STORAGE_KEY) || '',
  );
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteModalSelecionado, setClienteModalSelecionado] = useState('');

  useEffect(() => {
    if (!onLoadSummary) return;
    if (!clienteSelecionado) return;
    onLoadSummary(clienteSelecionado).catch(() => {});
  }, [clienteSelecionado]);

  // persiste a última escolha
  useEffect(() => {
    if (clienteSelecionado) {
      localStorage.setItem(STORAGE_KEY, clienteSelecionado);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [clienteSelecionado]);

  // garante que o selecionado ainda existe; se não, limpa e reabre
  useEffect(() => {
    if (!clienteSelecionado) return;
    const exists = clients?.some((c) => String(c.id) === String(clienteSelecionado));
    if (!exists) {
      setClienteSelecionado('');
      setClienteModalSelecionado('');
    }
  }, [clients, clienteSelecionado]);

  // força abrir modal se nenhum cliente foi escolhido
  useEffect(() => {
    if (clienteSelecionado) return;
    if (!clients?.length) return;
    if (!clienteModalOpen) setClienteModalOpen(true);
  }, [clienteSelecionado, clients, clienteModalOpen]);

  const filteredContracts =
    clienteSelecionado === ''
      ? []
      : contracts.filter((ctr) => String(ctr.clienteId) === String(clienteSelecionado));

  const fallbackTotal = filteredContracts.reduce((sum, ctr) => sum + Number(ctr.valor || 0), 0);
  const fallbackMediaRent = filteredContracts.length
    ? filteredContracts.reduce((sum, ctr) => sum + Number(ctr.rentabilidade || 0), 0) /
      filteredContracts.length
    : 0;

  const totalValor = summary?.totalValor ?? fallbackTotal;
  const mediaRent = summary?.mediaRent ?? fallbackMediaRent;
  const lucroFuturo = summary?.lucroFuturo ?? totalValor * (mediaRent / 100);
  const resgateFuturo = summary?.resgateFuturo ?? totalValor + lucroFuturo;
  const lucroMensal = summary?.lucroMensal ?? lucroFuturo / 12;
  const lucroHoje = summary?.lucroHoje ?? lucroFuturo / 365;
  const contratosAtivos = summary?.contratosAtivos ?? filteredContracts.length;

  const bars = summary?.bars?.length
    ? summary.bars.map((b) => ({ label: b.label, value: Number(b.value || 0) }))
    : filteredContracts.length
      ? filteredContracts.slice(0, 12).map((ctr, idx) => {
          const d = new Date(ctr.createdAt || ctr.created_at || Date.now());
          return {
            label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            value: Number(ctr.rentabilidade || 0) || 0.1 * (idx + 1),
          };
        })
      : [
          { label: 'jan', value: 0.4 },
          { label: 'fev', value: 0.6 },
          { label: 'mar', value: 1.0 },
          { label: 'abr', value: 0.3 },
          { label: 'mai', value: 0.8 },
          { label: 'jun', value: 1.4 },
        ];

  const maxBar = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="dashboard">
      <div className="hero">
        <div className="flex-between" style={{ gap: '1rem', alignItems: 'center' }}>
          <img src="/hr logo.png" alt="HR Investimentos" className="logo-img" />
          <div>
            {clienteSelecionado && (
              <h1 className="title" style={{ fontSize: '2.4rem', margin: '0 0 0.35rem' }}>
                Bem-vindo, {clients.find((c) => String(c.id) === String(clienteSelecionado))?.nome || '—'}!
              </h1>
            )}
            {!clienteSelecionado && (
              <h1 className="title" style={{ fontSize: '2.1rem', margin: '0 0 0.35rem' }}>
                Bem-vindo, {user?.name || ''}!
              </h1>
            )}
          </div>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flex: 1,
            }}
          >
            <div className="badge">Painel</div>
            <button
              type="button"
              className="pill"
              onClick={() => {
                setClienteModalSelecionado(clienteSelecionado || '');
                setClienteModalOpen(true);
              }}
            >
              Escolher cliente
            </button>
            <span className="badge">{filteredContracts.length} contratos</span>
          </div>
        </div>
      </div>
      {clienteSelecionado && (
      <div className="metrics kpis">
        <div className="metric">
          <p className="metric-title">Total Investido</p>
          <strong>
            {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="metric">
          <p className="metric-title">Resgate Futuro</p>
          <strong>
            {resgateFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="metric">
          <p className="metric-title">Lucro Futuro</p>
          <strong>
            {lucroFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="metric">
          <p className="metric-title">Rentabilidade/mês</p>
          <strong>{mediaRent.toFixed(2)}%</strong>
        </div>
        <div className="metric">
          <p className="metric-title">Contratos Ativos</p>
          <strong>{contratosAtivos}</strong>
        </div>
        <div className="metric">
          <p className="metric-title">Lucro Mensal</p>
          <strong>
            {lucroMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="metric">
          <p className="metric-title">Hoje você lucrou</p>
          <strong>
            {lucroHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="metric">
          <p className="metric-title">Até hoje você lucrou</p>
          <strong>
            {lucroFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
      </div>
      )}

      {clienteSelecionado && (
        <div className="card">
          <div className="flex-between">
            <h3 className="title">Rentabilidade mensal</h3>
            <span className="badge">Investimento → Recebimento</span>
          </div>
          {bars.length ? (
            <Chart
              type="bar"
              height={320}
              options={{
                chart: {
                  toolbar: { show: false },
                  foreColor: '#cdd7e0',
                  background: 'transparent',
                },
                plotOptions: { bar: { columnWidth: '55%' } },
                dataLabels: { enabled: false },
                grid: { strokeDashArray: 4, borderColor: 'rgba(255,255,255,0.08)' },
                xaxis: { categories: bars.map((b) => b.label) },
                yaxis: {
                  labels: {
                    formatter: (val) => `${Number(val || 0).toFixed(2)}%`,
                  },
                },
                tooltip: {
                  theme: 'dark',
                  y: {
                    formatter: (val) => `${Number(val || 0).toFixed(2)}%`,
                  },
                },
              }}
              series={[
                {
                  name: 'Rentabilidade/mês',
                  data: bars.map((b) => Number(b.value || 0)),
                },
              ]}
            />
          ) : (
            <p className="muted mini">Sem dados de rentabilidade no período selecionado.</p>
          )}
        </div>
      )}

      {clienteSelecionado && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="flex-between">
            <h3 className="title">Contratos atuais</h3>
            <span className="badge">Tabela</span>
          </div>
          <div className="table">
            <div className="table-row head">
              <span>Investidor</span>
              <span>Contrato</span>
              <span>Investido</span>
              <span>Rentab.</span>
              <span>Período</span>
              <span>Lucro</span>
            </div>
            {filteredContracts.map((ctr) => (
              <div key={ctr.id} className="table-row">
                <span>{user?.name || '—'}</span>
                <span>{ctr.titulo}</span>
                <span>
                  {Number(ctr.valor || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
                <span>{Number(ctr.rentabilidade || 0).toFixed(2)}%</span>
                <span>
                  {ctr.dataInvestimento
                    ? `${new Date(ctr.dataInvestimento).toLocaleDateString('pt-BR', {
                        month: 'short',
                        year: 'numeric',
                      })} → ${
                        ctr.dataRecebimento
                          ? new Date(ctr.dataRecebimento).toLocaleDateString('pt-BR', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'
                      }`
                    : '—'}
                </span>
                <span>
                  {(() => {
                    const valor = Number(ctr.valor || 0);
                    const rentMes = Number(ctr.rentabilidade || 0) / 100;
                    const start = ctr.dataInvestimento ? new Date(ctr.dataInvestimento) : null;
                    const end = ctr.dataRecebimento ? new Date(ctr.dataRecebimento) : null;
                    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                      return '—';
                    }
                    const months =
                      (end.getFullYear() - start.getFullYear()) * 12 +
                      (end.getMonth() - start.getMonth()) +
                      1;
                    const lucro = valor * rentMes * Math.max(1, months);
                    return lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                  })()}
                </span>
              </div>
            ))}
            {!filteredContracts.length && (
              <div className="table-row">
                <span colSpan={6}>Nenhum contrato ainda.</span>
              </div>
            )}
            {!!filteredContracts.length && (
              <div className="table-row total">
                <span>Total</span>
                <span>{filteredContracts.length} contratos</span>
                <span>
                  {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span>{mediaRent.toFixed(2)}%</span>
                <span>—</span>
                <span>—</span>
              </div>
            )}
          </div>
        </div>
      )}

      {clienteModalOpen && (
        <div className="modal-backdrop" onClick={() => setClienteModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between">
              <h3 className="title">Escolher cliente</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setClienteModalOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="table" style={{ maxHeight: '300px', overflow: 'auto' }}>
              <div className="table-row head">
                <span>Nome</span>
                <span>Sobrenome</span>
                <span>Documento</span>
                <span style={{ textAlign: 'right' }}>Selecionar</span>
              </div>
              {clients.map((c) => {
                const value = String(c.id);
                const active = clienteModalSelecionado === value;
                return (
                  <div
                    key={c.id}
                    className="table-row"
                    style={{ textAlign: 'left', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span>{c.nome}</span>
                    <span>{c.sobrenome}</span>
                    <span>{c.documento}</span>
                    <span style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="pill"
                        style={{
                          padding: '0.35rem 0.75rem',
                          background: active ? '#0f766e' : undefined,
                          color: active ? 'white' : undefined,
                        }}
                        onClick={() => {
                          setClienteModalSelecionado(value);
                          setClienteSelecionado(value);
                          setClienteModalOpen(false);
                        }}
                      >
                        {active ? 'Selecionado' : 'Selecionar'}
                      </button>
                    </span>
                  </div>
                );
              })}
              {!clients.length && (
                <div className="table-row">
                  <span colSpan={4}>Nenhum cliente cadastrado.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
