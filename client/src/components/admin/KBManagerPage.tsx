import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

interface KBFileContentResponse {
  path: string;
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<string, string> = {
  firm: 'Firm',
  faq: 'FAQ',
  reference: 'Reference',
  deal: 'Deal',
};

const CATEGORY_ORDER: string[] = ['firm', 'faq', 'reference', 'deal'];

const NEW_FILE_CATEGORIES = ['firm', 'faq', 'reference'];

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

/**
 * Build the fetch URL for a given KB file path.
 * Handles both flat paths like "firm/history.md" and nested paths
 * like "deal/parkview-commons/overview.md".
 */
function buildFileUrl(filePath: string): string {
  return `/api/admin/knowledge-base/file/${filePath}`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TreeSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="animate-pulse bg-gc-surface-elevated h-5 w-28 rounded" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div
              key={j}
              className="animate-pulse bg-gc-surface-elevated h-4 w-full rounded ml-3"
            />
          ))}
        </div>
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
/*  New File Form                                                      */
/* ------------------------------------------------------------------ */

interface NewFileFormProps {
  onSubmit: (category: string, filename: string) => void;
  onCancel: () => void;
  creating: boolean;
}

function NewFileForm({ onSubmit, onCancel, creating }: NewFileFormProps) {
  const [category, setCategory] = useState('firm');
  const [filename, setFilename] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = filename
      .trim()
      .replace(/\.md$/i, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-');
    if (!cleaned) return;
    onSubmit(category, cleaned + '.md');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gc-surface-elevated border border-gc-border rounded-lg p-4 space-y-3"
    >
      <p className="text-sm font-medium text-gc-text">New KB File</p>
      <div>
        <label htmlFor="new-file-category" className="text-xs text-gc-text-secondary block mb-1">
          Category
        </label>
        <select
          id="new-file-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-gc-bg border border-gc-border rounded px-2 py-1.5 text-sm text-gc-text focus:outline-none focus:ring-2 focus:ring-gc-accent appearance-none cursor-pointer"
        >
          {NEW_FILE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] || cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="new-file-name" className="text-xs text-gc-text-secondary block mb-1">
          Filename
        </label>
        <div className="flex items-center gap-1">
          <input
            id="new-file-name"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="my-file-name"
            className="flex-1 bg-gc-bg border border-gc-border rounded px-2 py-1.5 text-sm text-gc-text focus:outline-none focus:ring-2 focus:ring-gc-accent"
          />
          <span className="text-xs text-gc-text-secondary">.md</span>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={creating || !filename.trim()}
          className="bg-gc-accent hover:bg-gc-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gc-text-secondary hover:text-gc-text transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function KBManagerPage() {
  const api = useAdminApi();

  /* ---- state ---- */
  const [files, setFiles] = useState<KBFile[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<KBFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const [showNewFileForm, setShowNewFileForm] = useState(false);
  const [creatingFile, setCreatingFile] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ---- derived ---- */
  const hasUnsavedChanges = fileContent !== originalContent;

  const liveTokenCount = useMemo(() => estimateTokens(fileContent), [fileContent]);

  const groupedFiles = useMemo(() => {
    const groups: Record<string, KBFile[]> = {};
    for (const cat of CATEGORY_ORDER) {
      groups[cat] = [];
    }
    for (const file of files) {
      const cat = file.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(file);
    }
    // Sort files within each group alphabetically
    for (const cat of Object.keys(groups)) {
      groups[cat].sort((a, b) => a.path.localeCompare(b.path));
    }
    return groups;
  }, [files]);

  /* ---- fetch file list ---- */
  const fetchFiles = useCallback(() => {
    setLoading(true);
    api
      .get('/api/admin/knowledge-base')
      .then((data: KBInventoryResponse) => {
        setFiles(data.files ?? []);
        setTotalTokens(data.total_tokens ?? 0);
      })
      .catch(() => {
        setFiles([]);
        setTotalTokens(0);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  /* ---- fetch file content ---- */
  function handleSelectFile(file: KBFile) {
    // Warn about unsaved changes
    if (hasUnsavedChanges) {
      const discard = window.confirm(
        'You have unsaved changes. Discard and open another file?',
      );
      if (!discard) return;
    }

    setSelectedFile(file);
    setSaveMsg(null);
    setLoadingContent(true);

    const url = buildFileUrl(file.path);

    api
      .get(url)
      .then((data: KBFileContentResponse) => {
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
      await api.post('/api/admin/knowledge-base', {
        path: selectedFile.path,
        content: fileContent,
      });
      setOriginalContent(fileContent);
      setSaveMsg({ type: 'success', text: 'File saved successfully.' });
      // Refresh file list to update token counts
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

  /* ---- delete file ---- */
  async function handleDelete() {
    if (!selectedFile) return;
    const confirmed = window.confirm(
      `Delete "${selectedFile.path}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await api.del(`/api/admin/knowledge-base/${selectedFile.path}`);
      setSelectedFile(null);
      setFileContent('');
      setOriginalContent('');
      setSaveMsg(null);
      fetchFiles();
    } catch {
      setSaveMsg({ type: 'error', text: 'Failed to delete file.' });
    }
  }

  /* ---- create new file ---- */
  async function handleCreateFile(category: string, filename: string) {
    setCreatingFile(true);
    try {
      const filePath = `${category}/${filename}`;
      await api.post('/api/admin/knowledge-base', {
        path: filePath,
        content: '',
      });
      setShowNewFileForm(false);
      await fetchFiles();
      // Auto-select the new file
      const newFile: KBFile = {
        path: filePath,
        category,
        title: filename.replace(/\.md$/, ''),
        size_bytes: 0,
        estimated_tokens: 0,
        updated_at: new Date().toISOString(),
      };
      handleSelectFile(newFile);
    } catch {
      setSaveMsg({ type: 'error', text: 'Failed to create file.' });
    } finally {
      setCreatingFile(false);
    }
  }

  /* ---- toggle category collapse ---- */
  function toggleCategory(cat: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gc-text">Knowledge Base</h1>
        <button
          onClick={() => setShowNewFileForm((prev) => !prev)}
          className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New File
        </button>
      </div>

      {/* ---- Two-panel layout ---- */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* ======== Left Panel: File Tree ======== */}
        <div className="w-1/3 bg-gc-surface border border-gc-border rounded-xl flex flex-col min-h-0">
          <div className="p-4 border-b border-gc-border shrink-0">
            <p className="text-sm font-semibold text-gc-text">Files</p>
          </div>

          {loading ? (
            <TreeSkeleton />
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {/* New file form */}
              {showNewFileForm && (
                <div className="mb-2">
                  <NewFileForm
                    onSubmit={handleCreateFile}
                    onCancel={() => setShowNewFileForm(false)}
                    creating={creatingFile}
                  />
                </div>
              )}

              {/* Category groups */}
              {CATEGORY_ORDER.map((cat) => {
                const catFiles = groupedFiles[cat];
                if (!catFiles || catFiles.length === 0) return null;

                const isCollapsed = collapsedCategories.has(cat);

                return (
                  <div key={cat}>
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gc-surface-elevated transition-colors text-left"
                    >
                      <span className="text-gc-text-secondary text-xs select-none">
                        {isCollapsed ? '\u25B6' : '\u25BC'}
                      </span>
                      <span className="text-sm font-medium text-gc-text">
                        {CATEGORY_LABELS[cat] || cat}
                      </span>
                      <span className="text-xs text-gc-text-secondary ml-auto">
                        {catFiles.length}
                      </span>
                    </button>

                    {/* File entries */}
                    {!isCollapsed && (
                      <div className="ml-4 space-y-px">
                        {catFiles.map((file) => {
                          const isSelected = selectedFile?.path === file.path;
                          const filename = file.path.replace(/\\/g, '/').split('/').pop() || file.path;

                          return (
                            <button
                              key={file.path}
                              onClick={() => handleSelectFile(file)}
                              className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                                isSelected
                                  ? 'bg-gc-accent/15 text-gc-text'
                                  : 'hover:bg-gc-surface-elevated text-gc-text-secondary hover:text-gc-text'
                              }`}
                            >
                              <span className="text-xs truncate flex-1">
                                {filename}
                              </span>
                              <span
                                className={`text-xs font-mono-numbers shrink-0 ${tokenCountColor(file.estimated_tokens)}`}
                              >
                                {file.estimated_tokens.toLocaleString()}t
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======== Right Panel: Editor ======== */}
        <div className="w-2/3 bg-gc-surface border border-gc-border rounded-xl flex flex-col min-h-0">
          {!selectedFile ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gc-text-secondary text-sm">
                Select a file from the tree to edit
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
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-mono-numbers ${tokenCountColor(liveTokenCount)}`}>
                    {liveTokenCount.toLocaleString()} tokens
                  </span>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-gc-negative hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-gc-surface-elevated"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Textarea editor */}
              <div className="flex-1 p-4 min-h-0">
                <textarea
                  ref={textareaRef}
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
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
                  Discard Changes
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
      <div className="mt-4 flex items-center gap-6 px-4 py-3 bg-gc-surface border border-gc-border rounded-xl text-sm">
        <span className="text-gc-text-secondary">
          <span className="text-gc-text font-medium font-mono-numbers">
            {files.length}
          </span>{' '}
          files
        </span>
        <span className="text-gc-text-secondary">
          <span className={`font-medium font-mono-numbers ${tokenCountColor(totalTokens)}`}>
            {totalTokens.toLocaleString()}
          </span>{' '}
          total estimated tokens
        </span>
        <span className="text-gc-text-secondary">
          Per-request budget: <span className="text-gc-text font-medium">15,000 tokens</span>
        </span>
      </div>
    </div>
  );
}
