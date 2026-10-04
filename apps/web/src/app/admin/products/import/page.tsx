'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, Download, CheckCircle2, AlertCircle, Clock,
  FileSpreadsheet, ChevronRight, RotateCcw, Info, X,
} from 'lucide-react';
import { api, API_BASE } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ImportPreviewResponse, ImportRowPreview, ImportResult, ImportHistoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';

type Tab = 'products' | 'stock-price';
type Step = 'upload' | 'preview' | 'result';

// ── Status helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ImportRowPreview['status'] }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    New:       { label: 'YENİ',      cls: 'bg-green-100 text-green-700' },
    Update:    { label: 'GÜNCELLE',  cls: 'bg-blue-100 text-blue-700' },
    Unchanged: { label: 'DEĞİŞMEDİ',cls: 'bg-gray-100 text-gray-500' },
    Error:     { label: 'HATA',      cls: 'bg-red-100 text-red-700' },
    Duplicate: { label: 'KOPYA',     cls: 'bg-yellow-100 text-yellow-700' },
  };
  const { label, cls } = cfg[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide', cls)}>
      {label}
    </span>
  );
}

function ImportStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    Completed:     'bg-green-100 text-green-700',
    PartialSuccess:'bg-yellow-100 text-yellow-700',
    Failed:        'bg-red-100 text-red-700',
    Pending:       'bg-gray-100 text-gray-500',
  };
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded text-[10px] font-bold', cfg[status] ?? 'bg-gray-100 text-gray-500')}>
      {status === 'Completed' ? 'Tamamlandı' : status === 'PartialSuccess' ? 'Kısmi Başarı' : status === 'Failed' ? 'Başarısız' : status}
    </span>
  );
}

function importTypeName(t: string) {
  return t === 'ProductImport' ? 'Ürün Aktarımı' : t === 'StockPriceUpdate' ? 'Stok/Fiyat' : t;
}

// ── Summary cards ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn('flex flex-col items-center rounded-lg px-4 py-3 min-w-[80px]', color)}>
      <span className="text-xl font-bold tabular-nums">{value.toLocaleString('tr-TR')}</span>
      <span className="text-xs font-medium mt-0.5">{label}</span>
    </div>
  );
}

// ── File drop zone ─────────────────────────────────────────────────────────────

function FileDropZone({ onFile, accept = '.xlsx,.csv', disabled }: {
  onFile: (f: File) => void;
  accept?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile, disabled]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
        dragging ? 'border-brand bg-brand-muted' : 'border-border hover:border-brand/50 hover:bg-muted/30',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      )}
    >
      <FileSpreadsheet size={40} className="mx-auto mb-3 text-muted-foreground" />
      <p className="font-medium text-sm">Dosyayı buraya sürükleyin veya tıklayın</p>
      <p className="text-xs text-muted-foreground mt-1">Desteklenen: .xlsx, .csv (maks. 20 MB)</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
    </div>
  );
}

// ── Preview table ─────────────────────────────────────────────────────────────

type RowFilter = 'all' | 'Error' | 'New' | 'Update' | 'Unchanged' | 'Duplicate';

function PreviewTable({ rows }: { rows: ImportRowPreview[] }) {
  const [filter, setFilter] = useState<RowFilter>('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 100;

  const filtered = filter === 'all' ? rows : rows.filter(r => r.status === filter);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const filterOptions: { value: RowFilter; label: string }[] = [
    { value: 'all',       label: `Tümü (${rows.length})` },
    { value: 'Error',     label: `Hata (${rows.filter(r => r.status === 'Error').length})` },
    { value: 'New',       label: `Yeni (${rows.filter(r => r.status === 'New').length})` },
    { value: 'Update',    label: `Güncelle (${rows.filter(r => r.status === 'Update').length})` },
    { value: 'Duplicate', label: `Kopya (${rows.filter(r => r.status === 'Duplicate').length})` },
    { value: 'Unchanged', label: `Değişmedi (${rows.filter(r => r.status === 'Unchanged').length})` },
  ];

  return (
    <div>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => { setFilter(opt.value); setPage(0); }}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-colors',
              filter === opt.value
                ? 'bg-brand text-white border-brand'
                : 'border-border hover:bg-muted',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground w-12">Satır</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground w-24">Durum</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">SKU</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Ürün Adı</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Marka</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Kategori</th>
              <th className="text-right py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Fiyat</th>
              <th className="text-right py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Stok</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Sorunlar</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">Satır bulunamadı</td></tr>
            ) : pageRows.map(row => (
              <tr
                key={row.rowNumber}
                className={cn(
                  'border-b last:border-0',
                  row.status === 'Error' ? 'bg-red-50' :
                  row.status === 'Duplicate' ? 'bg-yellow-50' :
                  row.status === 'New' ? 'bg-green-50/40' : '',
                )}
              >
                <td className="py-2 px-3 text-muted-foreground">{row.rowNumber}</td>
                <td className="py-2 px-3"><StatusBadge status={row.status} /></td>
                <td className="py-2 px-3 font-mono">{row.sku ?? '—'}</td>
                <td className="py-2 px-3 max-w-[160px] truncate">{row.name ?? '—'}</td>
                <td className="py-2 px-3 hidden sm:table-cell">{row.brandName ?? '—'}</td>
                <td className="py-2 px-3 hidden md:table-cell">{row.categoryName ?? '—'}</td>
                <td className="py-2 px-3 text-right hidden md:table-cell">{row.price != null ? `₺${row.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—'}</td>
                <td className="py-2 px-3 text-right hidden md:table-cell">{row.stock ?? '—'}</td>
                <td className="py-2 px-3 text-red-600 max-w-[200px]">
                  {row.issues.length > 0 && (
                    <ul className="space-y-0.5">
                      {row.issues.map((iss, i) => <li key={i} className="truncate">{iss}</li>)}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-muted-foreground">{filtered.length} satırdan {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} gösteriliyor</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-muted">Önceki</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-muted">Sonraki</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ImportPage() {
  const { accessToken } = useAuthStore();
  const [tab, setTab] = useState<Tab>('products');
  const [step, setStep] = useState<Step>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(() => {
    if (!accessToken) return;
    setHistoryLoading(true);
    api.admin.import.history(accessToken)
      .then(d => setHistory(d as ImportHistoryItem[]))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [accessToken]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const reset = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setAllowOverwrite(false);
  };

  const handleTabChange = (t: Tab) => {
    if (t === tab) return;
    setTab(t);
    reset();
  };

  const handleUpload = async () => {
    if (!selectedFile || !accessToken) return;
    setLoading(true);
    setError('');
    try {
      let data: unknown;
      if (tab === 'products') {
        data = await api.admin.import.previewProducts(selectedFile, allowOverwrite);
      } else {
        data = await api.admin.import.previewStockPrice(selectedFile);
      }
      setPreview(data as ImportPreviewResponse);
      setStep('preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dosya işlenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!preview || !accessToken) return;
    setLoading(true);
    setError('');
    try {
      let data: unknown;
      if (tab === 'products') {
        data = await api.admin.import.commitProducts(preview.previewToken, accessToken);
      } else {
        data = await api.admin.import.commitStockPrice(preview.previewToken, accessToken);
      }
      setResult(data as ImportResult);
      setStep('result');
      fetchHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Aktarım sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = (type: 'products' | 'stock-price') => {
    const url = `${API_BASE}/api/admin/import/template/${type}`;
    const token = accessToken;
    if (!token) return;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = type === 'products' ? 'urun-import-sablonu.xlsx' : 'stok-fiyat-sablonu.xlsx';
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => {});
  };

  const canCommit = preview && (preview.new > 0 || preview.update > 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} />
          Ürünler
        </Link>
        <ChevronRight size={14} className="text-muted-foreground" />
        <h1 className="text-xl font-bold">Toplu Aktarım</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {([
          { key: 'products', label: 'Ürün Aktarımı' },
          { key: 'stock-price', label: 'Stok & Fiyat Güncelleme' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-brand text-brand'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['upload', 'preview', 'result'] as const).map((s, i) => {
          const labels = ['Yükle', 'Önizleme', 'Tamamlandı'];
          const isActive = step === s;
          const isDone = (step === 'preview' && i < 1) || (step === 'result' && i < 2);
          return (
            <span key={s} className="flex items-center gap-2">
              <span className={cn(
                'inline-flex h-6 w-6 rounded-full items-center justify-center text-xs font-bold',
                isActive ? 'bg-brand text-white' : isDone ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground',
              )}>
                {isDone ? <CheckCircle2 size={14} /> : i + 1}
              </span>
              <span className={cn('font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>{labels[i]}</span>
              {i < 2 && <ChevronRight size={14} className="text-muted-foreground" />}
            </span>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto shrink-0"><X size={14} /></button>
        </div>
      )}

      {/* ── STEP 1: Upload ───────────────────────────────────────────── */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Info size={16} className="text-brand" />
              Nasıl Kullanılır?
            </h2>
            <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
              <li>Excel şablonunu indirin</li>
              <li>{tab === 'products' ? 'Ürün bilgilerini şablona ekleyin' : 'SKU, stok ve fiyat bilgilerini girin'}</li>
              <li>Dosyayı yükleyin</li>
              <li>Önizlemeyi inceleyin, hataları kontrol edin</li>
              <li>Aktarımı onaylayın</li>
            </ol>
          </div>

          {/* Template download */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3">Excel Şablonu</h2>
            <button
              onClick={() => downloadTemplate(tab === 'products' ? 'products' : 'stock-price')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand text-brand text-sm font-medium hover:bg-brand-muted transition-colors"
            >
              <Download size={15} />
              {tab === 'products' ? 'Ürün Şablonunu İndir' : 'Stok/Fiyat Şablonunu İndir'}
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              {tab === 'products'
                ? 'Şablon: SKU, Ürün Adı, Marka, Kategori, Barkod, Fiyat, Stok, Ağırlık, Boyutlar, Garanti, Aktif'
                : 'Şablon: SKU, Stok, Fiyat (yalnızca bu 3 alan güncellenir)'}
            </p>
          </div>

          {/* File upload */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Dosya Yükle</h2>
            <FileDropZone onFile={setSelectedFile} disabled={loading} />

            {selectedFile && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <FileSpreadsheet size={16} className="text-brand shrink-0" />
                <span className="flex-1 truncate font-medium">{selectedFile.name}</span>
                <span className="text-muted-foreground shrink-0">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
            )}

            {tab === 'products' && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowOverwrite}
                  onChange={e => setAllowOverwrite(e.target.checked)}
                  className="rounded border-border"
                />
                <span>Boş hücreler mevcut değerlerin üzerine yazabilir</span>
                <span className="text-xs text-muted-foreground">(varsayılan: kapalı)</span>
              </label>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <><RotateCcw size={15} className="animate-spin" /> İşleniyor…</>
              ) : (
                <><Upload size={15} /> Önizleme Oluştur</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Preview ──────────────────────────────────────────── */}
      {step === 'preview' && preview && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Önizleme Özeti</h2>
              <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <RotateCcw size={13} /> Yeniden Yükle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <SummaryCard label="Toplam" value={preview.total} color="bg-gray-100 text-gray-700" />
              <SummaryCard label="Yeni" value={preview.new} color="bg-green-100 text-green-700" />
              <SummaryCard label="Güncelle" value={preview.update} color="bg-blue-100 text-blue-700" />
              <SummaryCard label="Değişmedi" value={preview.unchanged} color="bg-gray-100 text-gray-500" />
              <SummaryCard label="Hata" value={preview.error} color="bg-red-100 text-red-700" />
              <SummaryCard label="Kopya" value={preview.duplicate} color="bg-yellow-100 text-yellow-700" />
            </div>

            {preview.error > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{preview.error} satırda hata var. Hatalı satırlar atlanacak, diğerleri aktarılacaktır.</span>
              </div>
            )}

            {!canCommit && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 border px-3 py-2 text-sm text-muted-foreground">
                <Info size={15} className="mt-0.5 shrink-0" />
                <span>Aktarılacak yeni veya güncellenecek ürün bulunamadı.</span>
              </div>
            )}
          </div>

          {/* Preview table */}
          {preview.rows.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold mb-4">
                Satır Önizlemesi
                <span className="ml-2 text-xs font-normal text-muted-foreground">(ilk 500 satır gösteriliyor)</span>
              </h2>
              <PreviewTable rows={preview.rows} />
            </div>
          )}

          {/* Confirm / cancel */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCommit}
              disabled={!canCommit || loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <><RotateCcw size={15} className="animate-spin" /> Aktarılıyor…</>
              ) : (
                <><CheckCircle2 size={15} /> Aktarımı Onayla ({(preview.new + preview.update).toLocaleString('tr-TR')} satır)</>
              )}
            </button>
            <button onClick={reset} className="px-4 py-2.5 rounded-lg border text-sm hover:bg-muted transition-colors">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Result ───────────────────────────────────────────── */}
      {step === 'result' && result && (
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <CheckCircle2 size={28} className="text-green-500 shrink-0" />
              <div>
                <h2 className="font-semibold text-lg">Aktarım Tamamlandı</h2>
                <p className="text-sm text-muted-foreground">{result.durationSeconds.toFixed(1)} saniyede tamamlandı</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <SummaryCard label="Oluşturuldu" value={result.created} color="bg-green-100 text-green-700" />
              <SummaryCard label="Güncellendi" value={result.updated} color="bg-blue-100 text-blue-700" />
              <SummaryCard label="Değişmedi" value={result.unchanged} color="bg-gray-100 text-gray-500" />
              <SummaryCard label="Başarısız" value={result.failed} color="bg-red-100 text-red-700" />
              <SummaryCard label="Atlandı" value={result.skipped} color="bg-yellow-100 text-yellow-700" />
            </div>

            {result.errors.length > 0 && (
              <details className="rounded-lg border bg-red-50 p-3">
                <summary className="text-sm font-medium text-red-700 cursor-pointer">
                  {result.errors.length} hata detayı
                </summary>
                <ul className="mt-2 space-y-1">
                  {result.errors.slice(0, 50).map((e, i) => (
                    <li key={i} className="text-xs text-red-600">{e}</li>
                  ))}
                </ul>
              </details>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
              >
                <Upload size={14} /> Yeni Aktarım
              </button>
              <Link href="/admin/products" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors">
                Ürünlere Git
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Import History ───────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            Aktarım Geçmişi
          </h2>
          <button onClick={fetchHistory} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <RotateCcw size={12} /> Yenile
          </button>
        </div>

        {historyLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Yükleniyor…</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Henüz aktarım yapılmamış.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Tarih</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Tür</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Admin</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Toplam</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Oluşturuldu</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Güncellendi</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground hidden lg:table-cell">Başarısız</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground hidden lg:table-cell">Süre</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Durum</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                      {new Date(h.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 font-medium">{importTypeName(h.importType)}</td>
                    <td className="py-2 px-3 text-muted-foreground hidden sm:table-cell">{h.adminEmail ?? '—'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{h.totalRows.toLocaleString('tr-TR')}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-green-700 hidden md:table-cell">{h.created}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-blue-700 hidden md:table-cell">{h.updated}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-red-600 hidden lg:table-cell">{h.failed}</td>
                    <td className="py-2 px-3 text-right text-muted-foreground hidden lg:table-cell">{h.durationSeconds.toFixed(1)}s</td>
                    <td className="py-2 px-3 text-center"><ImportStatusBadge status={h.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
