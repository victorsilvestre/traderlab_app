'use client';

import Link from 'next/link';
import { ChevronDown, ChevronUp, Pencil, Pause, Play, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ManagedHomeBannerDto, ManagedHomeBannersDto } from '@traderlab/contracts';
import { AdminBackLink } from '../navigation/AdminBackLink';
import styles from './AdminBannerCatalog.module.css';

function BannerIcon({ kind }: { kind: 'up' | 'down' | 'activate' | 'deactivate' | 'edit' }) {
  const Icon = { up: ChevronUp, down: ChevronDown, activate: Play, deactivate: Pause, edit: Pencil }[kind];
  return <Icon aria-hidden="true" size={17} strokeWidth={1.8} />;
}

function BannerRow({ banner, index, count, activeCount, returnTo, onMove, onStatus, busy }: {
  banner: ManagedHomeBannerDto;
  index?: number;
  count: number;
  activeCount: number;
  returnTo: string;
  onMove: (from: number, to: number) => void;
  onStatus: (banner: ManagedHomeBannerDto, status: 'published' | 'draft') => void;
  busy: boolean;
}) {
  const active = banner.status === 'published';
  const editHref = `/banners/${banner.id}?returnTo=${encodeURIComponent(returnTo)}`;
  return (
    <div className={styles.row} role="row">
      <div className={styles.previewCell} role="cell"><div className={styles.preview} style={{ backgroundImage: `url("${banner.imageUrl}")` }} role="img" aria-label={banner.altText} /></div>
      <div className={styles.identity} role="cell">
        <Link className={styles.rowDetailsLink} href={editHref} aria-label={`Abrir detalhes do banner ${banner.internalName}`}>
          <strong title={banner.internalName}>{banner.internalName}</strong>
        </Link>
      </div>
      <div className={styles.position} role="cell">{active ? index! + 1 : '—'}</div>
      <div className={styles.statusCell} role="cell"><span className={active ? styles.activeBadge : styles.inactiveBadge}>{active ? 'Ativo' : 'Inativo'}</span></div>
      <div className={styles.actions} role="cell">
        <Link className={styles.iconButton} href={editHref} aria-label="Editar banner" title="Editar banner" data-tooltip="Editar banner"><BannerIcon kind="edit" /></Link>
        {active && <>
          <button className={styles.iconButton} type="button" aria-label="Mover banner para cima" title="Mover para cima" data-tooltip="Mover para cima" disabled={busy || index === 0} onClick={() => onMove(index!, index! - 1)}><BannerIcon kind="up" /></button>
          <button className={styles.iconButton} type="button" aria-label="Mover banner para baixo" title="Mover para baixo" data-tooltip="Mover para baixo" disabled={busy || index === count - 1} onClick={() => onMove(index!, index! + 1)}><BannerIcon kind="down" /></button>
        </>}
        <button className={`${styles.iconButton} ${active ? styles.deactivate : styles.activate}`} type="button" aria-label={active ? 'Inativar banner' : 'Ativar banner'} title={active ? 'Inativar banner' : 'Ativar banner'} data-tooltip={active ? 'Inativar banner' : activeCount >= 5 ? 'Inative outro banner para liberar uma vaga' : 'Ativar banner'} disabled={busy || (!active && activeCount >= 5)} onClick={() => onStatus(banner, active ? 'draft' : 'published')}><BannerIcon kind={active ? 'deactivate' : 'activate'} /></button>
      </div>
    </div>
  );
}

export function AdminBannerCatalog({ data, errorMessage, returnTo }: { data?: ManagedHomeBannersDto; errorMessage?: string; returnTo: string }) {
  const router = useRouter();
  const [items, setItems] = useState(data?.items ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(errorMessage ?? '');
  const active = items.filter((item) => item.status === 'published').sort((a, b) => a.displayOrder - b.displayOrder);
  const inactive = items.filter((item) => item.status === 'draft');
  const rows = [...active, ...inactive];
  const returnHref = `/banners${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;

  async function updateStatus(banner: ManagedHomeBannerDto, status: 'published' | 'draft') {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message ?? 'Não foi possível atualizar o banner.');
      setItems((current) => {
        const next = current.map((item) => item.id === banner.id ? { ...item, status, displayOrder: status === 'draft' ? 0 : item.displayOrder } : item);
        const nextActive = next.filter((item) => item.status === 'published');
        const changed = nextActive.find((item) => item.id === banner.id);
        if (status === 'published' && changed) changed.displayOrder = Math.max(0, ...nextActive.filter((item) => item.id !== banner.id).map((item) => item.displayOrder)) + 1;
        nextActive.sort((left, right) => left.displayOrder - right.displayOrder || left.id - right.id);
        nextActive.forEach((item, index) => { item.displayOrder = index + 1; });
        return [...nextActive, ...next.filter((item) => item.status === 'draft')];
      });
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o banner.'); }
    finally { setBusy(false); }
  }

  async function move(from: number, to: number) {
    const previousActive = [...active];
    const reordered = [...active];
    const [moved] = reordered.splice(from, 1);
    if (!moved) return;
    reordered.splice(to, 0, moved);
    const positioned = reordered.map((item, index) => ({ ...item, displayOrder: index + 1 }));
    setItems([...positioned, ...inactive]);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/banners/order', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: positioned.map((item) => item.id) }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message ?? 'Não foi possível salvar a ordem.');
      router.refresh();
    } catch (cause) {
      setItems([...previousActive, ...inactive]);
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a ordem.');
    }
    finally { setBusy(false); }
  }

  return (
    <section className={styles.page} aria-labelledby="banners-title">
      <AdminBackLink href={returnTo} />
      <header className={styles.heading}>
        <div><h1 id="banners-title">Banners</h1><p>Organize as comunicações exibidas na página inicial.</p></div>
        {data && active.length >= data.activeLimit ? (
          <div className={styles.addAction}>
            <span className={styles.limitNotice}>Já tem cinco banners. Você precisa inativar um para cadastrar outro.</span>
            <button className={styles.addButton} type="button" disabled aria-label="Cadastro bloqueado: já há cinco banners ativos. Inative um para cadastrar outro." title="Já tem cinco banners. Você precisa inativar um." data-tooltip="Já tem cinco banners. Você precisa inativar um."><Plus aria-hidden="true" size={20} strokeWidth={1.8} /></button>
          </div>
        ) : (
          <Link className={styles.addButton} href={`/banners/new?returnTo=${encodeURIComponent(returnHref)}`} aria-label="Novo banner" title="Novo banner" data-tooltip="Novo banner"><Plus aria-hidden="true" size={20} strokeWidth={1.8} /></Link>
        )}
      </header>
      {error && <p className={styles.feedback} role="alert">{error}</p>}
      {!data && !errorMessage ? <p className={styles.empty}>Carregando banners…</p> : null}
      {data && rows.length === 0 && <div className={styles.empty}><strong>Nenhum banner cadastrado</strong><p>Adicione um banner para começar a organizar a vitrine.</p><Link href={`/banners/new?returnTo=${encodeURIComponent(returnHref)}`}>Cadastrar banner</Link></div>}
      {data && rows.length > 0 && <>
        <div className={styles.listHeading}><h2>Banners cadastrados</h2><span>{active.length} de {data.activeLimit} ativos · {data.activeLimit - active.length} vagas</span></div>
        <div className={styles.table} role="table" aria-label="Banners cadastrados">
          <div className={styles.tableHeader} role="row"><span role="columnheader">Imagem</span><span role="columnheader">Banner</span><span role="columnheader">Ordem</span><span role="columnheader">Status</span><span role="columnheader">Ações</span></div>
          {rows.map((banner) => <BannerRow key={banner.id} banner={banner} index={active.findIndex((item) => item.id === banner.id)} count={active.length} activeCount={active.length} returnTo={returnHref} onMove={move} onStatus={updateStatus} busy={busy} />)}
        </div>
      </>}
    </section>
  );
}
