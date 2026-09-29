'use client';
import { useMemo, useState } from 'react';

const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';
type Account = { id: string; name: string; broker: string; accountNumber?: string; mode: string };

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [message, setMessage] = useState('Crie uma conta ou importe um relatório Profit para começar.');
  const [preview, setPreview] = useState<any>();
  const [accountName, setAccountName] = useState('Conta principal');
  const [broker, setBroker] = useState('XP');
  const [files, setFiles] = useState<FileList | null>(null);
  const selectedAccount = useMemo(() => accounts[0], [accounts]);

  async function createAccount() {
    const response = await fetch(`${api}/v1/accounts`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: accountName, broker, mode: 'REAL' }) });
    const account = await response.json();
    if (!response.ok) return setMessage(account.message ?? 'Não foi possível criar a conta.');
    setAccounts((current) => [...current, account]);
    setMessage(`Conta ${account.name} criada.`);
  }
  async function importFiles() {
    if (!files?.length) return setMessage('Selecione os CSVs exportados pelo Profit.');
    const payload = { files: await Promise.all([...files].map(async (file) => ({ name: file.name, contentBase64: btoa(String.fromCharCode(...new Uint8Array(await file.arrayBuffer()))) }))) };
    const response = await fetch(`${api}/v1/imports/preview`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.message ?? 'Falha ao preparar a importação.');
    setPreview(body); setMessage(`${body.operations.length} operação(ões) pronta(s) para revisão.`);
  }
  async function addManualOperation() {
    if (!selectedAccount) return setMessage('Crie uma conta antes de registrar uma operação.');
    const now = new Date();
    const response = await fetch(`${api}/v1/operations/manual`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ accountId: selectedAccount.id, ticker: 'WINV26', scalpIncluded: false, executions: [{ side: 'BUY', quantity: 1, price: 100000, executedAt: now.toISOString() }, { side: 'SELL', quantity: 1, price: 100100, executedAt: new Date(now.getTime() + 60000).toISOString() }] }) });
    const body = await response.json(); setMessage(response.ok ? `Operação manual: resultado líquido R$ ${body.result.net.toFixed(2)}.` : body.message);
  }
  return <main>
    <header><span className="brand">TraderLab</span><span className="badge">Base funcional</span></header>
    <section className="hero"><p className="eyebrow">TRADE LOG</p><h1>Seu histórico operacional, com contexto.</h1><p>Importe operações Profit, revise parciais e registre o que realmente aconteceu em cada trade.</p></section>
    <p className="notice">{message}</p>
    <div className="grid">
      <section className="card"><h2>1. Conta operacional</h2><label>Nome<input value={accountName} onChange={(event) => setAccountName(event.target.value)} /></label><label>Corretora<input value={broker} onChange={(event) => setBroker(event.target.value)} /></label><button onClick={createAccount}>Criar conta</button><button className="secondary" onClick={addManualOperation}>Testar operação manual</button>{accounts.map((account) => <p key={account.id} className="account">{account.name} · {account.broker} · {account.mode}</p>)}</section>
      <section className="card"><h2>2. Importar Profit</h2><p>Envie o Relatório de Performance e, opcionalmente, a Lista de Ordens no mesmo lote.</p><input type="file" accept=".csv,text/csv" multiple onChange={(event) => setFiles(event.target.files)} /><button onClick={importFiles}>Preparar revisão</button><small>O sistema aceita colunas opcionais ausentes e reconhece os arquivos pelos cabeçalhos.</small></section>
    </div>
    {preview && <section className="card review"><h2>3. Revisão do lote</h2><p className="badge">{preview.status}</p>{preview.operations.map((operation: any, index: number) => <details key={`${operation.ticker}-${index}`} open={index === 0}><summary>{operation.ticker} · {operation.direction === 'BUY' ? 'Compra' : 'Venda'} · {operation.openedAt}</summary><div className="operation"><p>Quantidade: {operation.buyQuantity || operation.sellQuantity} · Resultado importado: {operation.grossResult ?? 'indisponível'}</p><p>Execuções identificadas: {operation.executions.length}</p><label>Scalp na operação<select><option>Não</option><option>Sim</option></select></label><div className="tags"><span className="tag official">TDS — placeholder</span><button className="link">Gerenciar classificações</button></div></div></details>)}</section>}
  </main>;
}
