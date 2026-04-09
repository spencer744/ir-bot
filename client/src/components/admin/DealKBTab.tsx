import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DealKBTabProps {
  deal: any;
  dealId: string;
  onSave: (deal: any) => void;
}

interface KBFile {
  path: string;
  category: string;
  title: string;
  size_bytes: number;
  estimated_tokens: number;
  updated_at: string;
}

interface KBInventoryResponse {
  total_files: number;
  total_tokens: number;
  files: KBFile[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

function tokenCountColor(tokens: number): string {
  if (tokens > 2500) return 'text-red-400';
  if (tokens > 2000) return 'text-amber-400';
  return 'text-gc-text-secondary';
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gc-surface-elevated h-9 rounded"
        />
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex flex-col h-full p-6 space-y-4">
      <div className="animate-pulse bg-gc-surface-elevated h-5 w-64 rounded" />
      <div className="animate-pulse bg-gc-surface-elevated flex-1 rounded" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function DealKBTab({ deal, dealId: _dealId, onSave: _onSave }: DealKBTabProps) {
  const api = useAdminApi();

  const slug = deal?.slug;

  /* ---- state ---- */
  const [files, setFiles] = useState<KBFile[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<KBFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ---- derived ---- */
  const hasUnsavedChanges = fileContent !== originalContent;
  const liveTokenCount = useMemo(() => estimateTokens(fileContent), [fileContent]);

  const dealPrefix = slug ? `deal/${slug}/` : null;

  const dealFiles = useMemo(() => {
    if (!dealPrefix) return [];
    return files
      .filter((f) => {
        const normalizedPath = f.path.replace(/\\/g, '/');
        return f.category === 'deal' && normalizedPath.startsWith(dealPrefix);
      })
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [files, dealPrefix]);

  const totalDealTokens = useMemo(
    () => dealFiles.reduce((sum, f) => sum + f.estimated_tokens, 0),
    [dealFiles],
  );

  /* ---- fetch file list ---- */
  const fetchFiles = useCallback(() => {
    setLoading(true);
    api
      .get('/admin/knowledge-base')
      .then((data: KBInventoryResponse) => {
        setFiles(data.files ?? []);
      })
      .catch(() => {
        setFiles([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    fetchFiles();
  }, [fetchFiles, slug]);

  /* ---- fetch file content ---- */
  function handleSelectFile(file: KBFile) {
    if (hasUnsavedChanges) {
      const discard = window.confirm(
        'You have unsaved changes. Discard and open another file?',
      );
      if (!discard) return;
    }

    setSelectedFile(file);
    setSaveMsg(null);
    setLoadingContent(true);

    api
      .get(`/api/admin/knowledge-base/file/${file.path}`)
      .then((data: { path: string; content: string }) => {
        setFileContent(data.content ?? '');
        setOriginalContent(data.content ?? '');
      })
      .catch(() => {
        setFileContent('');
        setOriginalContent('');
        setSaveMsg({ type: 'error', text: 'Failed to load file content.' });
      })
      .finally(() => setLoadingContent(false));
  }

  /* ---- save file ---- */
  async function handleSave() {
    if (!selectedFile) return;
    setSaving(true);
    setSaveMsg(null);

    try {
      await api.post('/admin/knowledge-base', {
        path: selectedFile.path,
        content: fileContent,
      });
      setOriginalContent(fileContent);
      setSaveMsg({ type: 'success', text: 'File saved successfully.' });
      fetchFiles();
    } catch {
      setSaveMsg({ type: 'error', text: 'Failed to save file.' });
    } finally {
      setSaving(false);
    }
  }

  /* ---- discard changes ---- */
  function handleDiscard() {
    setFileContent(originalContent);
    setSaveMsg(null);
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  /* No slug guard */
  if (!slug) {
    return (
      <div className="bg-gc-surface border border-gc-border rounded-xl p-8 text-center">
        <p className="text-gc-text-secondary text-sm">
          Save deal with a slug first to manage KB files
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---- Two-panel layout ---- */}
      <div className="flex gap-4 min-h-[28rem]">
        {/* ======== Left Panel: File List ======== */}
        <div className="w-1/3 bg-gc-surface border border-gc-border rounded-xl flex flex-col min-h-0">
          <div className="p-4 border-b border-gc-border shrink-0">
            <p className="text-sm font-semibold text-gc-text">
              Deal KB Files
            </p>
            <p className="text-xs text-gc-text-secondary mt-0.5">
              deal/{slug}/
            </p>
          </div>

          {loading ? (
            <ListSkeleton />
          ) : dealFiles.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-gc-text-secondary text-sm">
                  No KB files found for this deal.
                </p>
                <p className="text-gc-text-secondary/60 text-xs mt-1">
                  Expected path: server/kb/deal/{slug}/
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-px">
              {dealFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                const filename = file.path.replace(/\\/g, '/').split('/').pop() || file.path;

                return (
                  <button
                    key={file.path}
                    onClick={() => handleSelectFile(file)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-gc-accent/15 text-gc-text'
                        : 'hover:bg-gc-surface-elevated text-gc-text-secondary hover:text-gc-text'
                    }`}
                  >
                    <span className="text-sm truncate flex-1">
                      {filename}
                    </span>
                    <span
                      className={`text-xs font-mono shrink-0 ${tokenCountColor(file.estimated_tokens)}`}
                    >
                      {file.estimated_tokens.toLocaleString()}t
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ======== Right Panel: Editor ======== */}
        <div className="w-2/3 bg-gc-surface border border-gc-border rounded-xl flex flex-col min-h-0">
          {!selectedFile ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gc-text-secondary text-sm">
                Select a file from the list to edit
              </p>
            </div>
          ) : loadingContent ? (
            <EditorSkeleton />
          ) : (
            <>
              {/* File header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gc-border shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <p className="text-sm font-mono text-gc-text truncate">
                    {selectedFile.path}
                  </p>
                  {hasUnsavedChanges && (
                    <span className="text-xs text-amber-400 shrink-0">
                      (unsaved)
                    </span>
                  )}
                </div>
                <span className={`text-xs font-mono shrink-0 ${tokenCountColor(liveTokenCount)}`}>
                  {liveTokenCount.toLocaleString()} tokens
                </span>
              </div>

              {/* Textarea editor */}
              <div className="flex-1 p-4 min-h-0">
                <textarea
                  value={fileContent}
                  onChange={(e) => {
                    setFileContent(e.target.value);
                    setSaveMsg(null);
                  }}
                  spellCheck={false}
                  className="w-full h-full bg-gc-bg border border-gc-border rounded-lg p-4 text-sm text-gc-text font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-gc-accent"
                />
              </div>

              {/* Actions bar */}
              <div className="flex items-center gap-3 px-6 py-3 border-t border-gc-border shrink-0">
                <button
                  onClick={handleSave}
                  disabled={saving || !hasUnsavedChanges}
                  className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleDiscard}
                  disabled={!hasUnsavedChanges}
                  className="text-sm text-gc-text-secondary hover:text-gc-text transition-colors disabled:opacity-50"
                >
                  Discard
                </button>
                {saveMsg && (
                  <span
                    className={`text-sm ml-2 ${
                      saveMsg.type === 'success'
                        ? 'text-gc-positive'
                        : 'text-gc-negative'
                    }`}
                  >
                    {saveMsg.text}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- Summary bar ---- */}
      <div className="flex items-center gap-6 px-4 py-3 bg-gc-surface border border-gc-border rounded-xl text-sm">
        <span className="text-gc-text-secondary">
          <span className="text-gc-text font-medium font-mono">
            {dealFiles.length}
          </span>{' '}
          file{dealFiles.length !== 1 ? 's' : ''}
        </span>
        <span className="text-gc-text-secondary">
          <span className={`font-medium font-mono ${tokenCountColor(totalDealTokens)}`}>
            {totalDealTokens.toLocaleString()}
          </span>{' '}
          total tokens for this deal
        </span>
      </div>
    </div>
  );
}
