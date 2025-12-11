import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import Chart from 'react-apexcharts';

export default function PublicDashboard() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.publicDashboard(token);
        setData(res);
      } catch (err) {
        setError(err.message || 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-panel">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="auth-shell">
        <div className="auth-panel">
          <h3>Link inválido</h3>
          <p className="muted">{error || 'Não foi possível carregar o dashboard.'}</p>
        </div>
      </div>
    );
  }

  const { client, summary, contracts } = data;
  const bars = summary?.bars?.length
    ? summary.bars.map((b) => ({ label: b.label, value: Number(b.value || 0) }))
    : [];

  return (
    <div className="dashboard">
      <div className="hero">
        <div className="flex-between" style={{ gap: '1rem', alignItems: 'center' }}>
          <img src="/hr logo.png" alt="HR Investimentos" className="logo-img" />
          <div>
            <h1 className="title" style={{ fontSize: '2.1rem', margin: '0 0 0.35rem' }}>
              Carteira de {client?.nome} {client?.sobrenome}
            </h1>
            <p className="muted">Visualização compartilhada (somente leitura)</p>
          </div>
        </div>
      </div>

      <div className="metrics kpis">
        <div className="metric">
          <p className="metric-title">Total Investido</p>
          <strong>
            {summary.totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="metric">
          <p className="metric-title">Resgate Futuro</p>
          <strong>
            {summary.resgateFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="metric">
          <p className="metric-title">Lucro Futuro</p>
          <strong>
            {summary.lucroFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="metric">
          <p className="metric-title">Rentabilidade/mês</p>
          <strong>{summary.mediaRent.toFixed(2)}%</strong>
        </div>
        <div className="metric">
          <p className="metric-title">Contratos Ativos</p>
          <strong>{summary.contratosAtivos}</strong>
        </div>
        <div className="metric">
          <p className="metric-title">Lucro Mensal</p>
          <strong>
            {summary.lucroMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
      </div>

      <div className="card">
        <div className="flex-between">
          <h3 className="title">Contratos</h3>
          <span className="badge">{contracts.length} contratos</span>
        </div>
        <div className="table">
          <div className="table-row head">
            <span>Título</span>
            <span>Valor</span>
            <span>Rent.</span>
            <span>Investimento</span>
            <span>Recebimento</span>
          </div>
          {contracts.map((ctr) => (
            <div className="table-row" key={ctr.id}>
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
                  ? new Date(ctr.dataInvestimento).toLocaleDateString('pt-BR')
                  : '—'}
              </span>
              <span>
                {ctr.dataRecebimento
                  ? new Date(ctr.dataRecebimento).toLocaleDateString('pt-BR')
                  : '—'}
              </span>
            </div>
          ))}
          {!contracts.length && (
            <div className="table-row">
              <span colSpan={5}>Nenhum contrato cadastrado.</span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex-between">
          <h3 className="title">Rentabilidade mensal</h3>
          <span className="badge">Visualização pública</span>
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
          <p className="muted mini">Sem dados de rentabilidade para este cliente.</p>
        )}
      </div>
    </div>
  );
}
