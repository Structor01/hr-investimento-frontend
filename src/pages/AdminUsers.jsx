import React, { useState } from 'react';

export default function AdminUsers({ users, clients, onLinkClientsToUser }) {
  const [openUserId, setOpenUserId] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);

  const toggleClient = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId],
    );
  };

  return (
    <>
      <div className="card">
        <div className="flex-between">
          <h2 className="title">Admin • Usuários</h2>
          <span className="badge">Admin</span>
        </div>
        <div className="table" style={{ marginTop: '0.75rem' }}>
          <div className="table-row head">
            <span>Nome</span>
            <span>Email</span>
            <span>Clientes</span>
            <span>Criado em</span>
            <span>Ações</span>
          </div>
          {users.map((u) => (
            <div key={u.id} className="table-row">
              <span>{u.name || '—'}</span>
              <span>{u.email}</span>
              <span>{u._count?.clientLinks ?? 0}</span>
              <span>
                {u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
              <span>
                <button
                  type="button"
                  className="pill"
                  onClick={() => {
                    setOpenUserId(u.id);
                    setSelectedClients([]);
                  }}
                >
                  Vincular clientes
                </button>
              </span>
            </div>
          ))}
          {!users.length && (
            <div className="table-row">
              <span colSpan={5}>Nenhum usuário cadastrado.</span>
            </div>
          )}
        </div>
      </div>

      {openUserId && (
        <div className="modal-backdrop" onClick={() => setOpenUserId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
              <div className="table" style={{ maxHeight: '300px', overflow: 'auto' }}>
                <div className="table-row head">
                  <span />
                  <span>Nome</span>
                  <span>Documento</span>
                </div>
                {clients.map((c) => (
                  <label key={c.id} className="table-row" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(c.id)}
                      onChange={() => toggleClient(c.id)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>
                      {c.nome} {c.sobrenome}
                    </span>
                    <span>{c.documento}</span>
                  </label>
                ))}
                {!clients.length && (
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
    </>
  );
}
