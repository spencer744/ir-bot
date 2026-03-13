import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TabProps {
  deal: any;
  dealId: string;
  onSave: (updatedDeal: any) => void;
}

interface MediaItem {
  id: string;
  type: 'image' | 'document';
  url: string;
  label: string;
  category?: string;
  sort_order?: number;
  document_role?: 'deck' | 'one_pager' | 'operating_agreement' | 'other' | null;
}

type PhotoCategory = 'Exterior' | 'Interior' | 'Amenity' | 'Renovation' | 'Progress' | 'Aerial';
type DocumentType = 'PDF' | 'Excel' | 'PowerPoint';
type DocumentRole = 'deck' | 'one_pager' | 'operating_agreement' | 'other';

const PHOTO_CATEGORIES: PhotoCategory[] = [
  'Exterior',
  'Interior',
  'Amenity',
  'Renovation',
  'Progress',
  'Aerial',
];

const DOCUMENT_TYPES: DocumentType[] = ['PDF', 'Excel', 'PowerPoint'];

const DOCUMENT_ROLES: { value: DocumentRole; label: string }[] = [
  { value: 'deck', label: 'Deck' },
  { value: 'one_pager', label: 'One-pager' },
  { value: 'operating_agreement', label: 'Operating agreement' },
  { value: 'other', label: 'Other' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isEmbeddable(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function toEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DealMediaTab({ deal, dealId, onSave }: TabProps) {
  const api = useAdminApi();

  /* ---- state ---- */
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Photo add form
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<PhotoCategory>('Exterior');
  const [addingPhoto, setAddingPhoto] = useState(false);

  // Document add form
  const [showDocForm, setShowDocForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>('PDF');
  const [newDocRole, setNewDocRole] = useState<DocumentRole>('other');
  const [addingDoc, setAddingDoc] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);

  // Video
  const [videoUrl, setVideoUrl] = useState(deal?.video_url ?? '');
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoMsg, setVideoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  /* ---- fetch media ---- */
  const fetchMedia = useCallback(async () => {
    try {
      const res: any = await api.get(`/api/admin/deals/${dealId}/media`);
      setMedia(res?.media ?? []);
    } catch {
      setMedia([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  useEffect(() => {
    if (!dealId || dealId === 'new') {
      setLoading(false);
      return;
    }
    fetchMedia();
  }, [dealId, fetchMedia]);

  useEffect(() => {
    setVideoUrl(deal?.video_url ?? '');
  }, [deal]);

  /* ---- derived ---- */
  const photos = media.filter((m) => m.type === 'image');
  const documents = media.filter((m) => m.type === 'document');

  /* ---- photo CRUD ---- */

  async function handleAddPhoto() {
    if (!newPhotoUrl.trim()) return;
    setAddingPhoto(true);
    try {
      await api.post(`/api/admin/deals/${dealId}/media`, {
        type: 'image',
        url: newPhotoUrl.trim(),
        label: newPhotoCaption.trim(),
        category: newPhotoCategory,
        sort_order: photos.length,
      });
      setNewPhotoUrl('');
      setNewPhotoCaption('');
      setNewPhotoCategory('Exterior');
      setShowPhotoForm(false);
      await fetchMedia();
    } catch {
      /* silent */
    } finally {
      setAddingPhoto(false);
    }
  }

  async function handleUpdateMedia(id: string, updates: Partial<MediaItem>) {
    try {
      await api.put(`/api/admin/deals/${dealId}/media/${id}`, updates);
      setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    } catch {
      // Optimistic update on error (demo mode)
      setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    }
  }

  async function handleDeleteMedia(id: string) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.del(`/api/admin/deals/${dealId}/media/${id}`);
      await fetchMedia();
    } catch {
      /* silent */
    }
  }

  /* ---- document CRUD ---- */

  async function handleUploadDocument(file: File) {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/admin/deals/${dealId}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) setNewDocUrl(data.url);
      else throw new Error(data.message || 'Upload failed');
    } catch {
      /* silent */
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleAddDocument() {
    if (!newDocTitle.trim() || !newDocUrl.trim()) return;
    setAddingDoc(true);
    try {
      await api.post(`/api/admin/deals/${dealId}/media`, {
        type: 'document',
        url: newDocUrl.trim(),
        label: newDocTitle.trim(),
        caption: newDocTitle.trim(),
        category: newDocType,
        sort_order: documents.length,
        document_role: newDocRole,
      });
      setNewDocTitle('');
      setNewDocUrl('');
      setNewDocType('PDF');
      setNewDocRole('other');
      setShowDocForm(false);
      await fetchMedia();
    } catch {
      /* silent */
    } finally {
      setAddingDoc(false);
    }
  }

  /* ---- video save ---- */

  async function handleSaveVideo() {
    setSavingVideo(true);
    setVideoMsg(null);

    try {
      const result = await api.put(`/api/admin/deals/${dealId}`, {
        video_url: videoUrl.trim(),
      });

      if (result?.deal) {
        onSave(result.deal);
        setVideoMsg({ type: 'success', text: 'Video URL saved successfully.' });
      } else {
        setVideoMsg({ type: 'success', text: 'Video URL saved (demo mode).' });
      }
    } catch {
      setVideoMsg({ type: 'error', text: 'Failed to save video URL.' });
    } finally {
      setSavingVideo(false);
    }
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  const inputClass =
    'bg-gc-bg border border-gc-border rounded-lg px-3 py-2 text-sm text-gc-text focus:outline-none focus:border-gc-accent-light w-full';
  const selectClass =
    'bg-gc-bg border border-gc-border rounded-lg px-3 py-2 text-sm text-gc-text focus:outline-none focus:border-gc-accent-light';

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gc-surface-elevated rounded-xl h-48" />
        ))}
      </div>
    );
  }

  const embedUrl = videoUrl.trim() ? toEmbedUrl(videoUrl.trim()) : null;

  return (
    <div className="space-y-8">
      {/* ---- Section 1: Photos ---- */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gc-text">Photos</h2>
          <button
            onClick={() => setShowPhotoForm((v) => !v)}
            className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showPhotoForm ? 'Cancel' : 'Add Photo'}
          </button>
        </div>

        {/* Add photo inline form */}
        {showPhotoForm && (
          <div className="mb-6 bg-gc-bg border border-gc-border rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="Image URL"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Caption"
              value={newPhotoCaption}
              onChange={(e) => setNewPhotoCaption(e.target.value)}
              className={inputClass}
            />
            <div className="flex items-center gap-3">
              <select
                value={newPhotoCategory}
                onChange={(e) => setNewPhotoCategory(e.target.value as PhotoCategory)}
                className={selectClass}
              >
                {PHOTO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddPhoto}
                disabled={addingPhoto || !newPhotoUrl.trim()}
                className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {addingPhoto ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Photo grid */}
        {photos.length === 0 ? (
          <p className="text-gc-text-secondary text-sm">
            No photos yet. Add photos to showcase the property.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-gc-bg border border-gc-border rounded-lg overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt={photo.label || 'Deal photo'}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    value={photo.label || ''}
                    onChange={(e) => handleUpdateMedia(photo.id, { label: e.target.value })}
                    placeholder="Caption"
                    className={inputClass}
                  />
                  <select
                    value={photo.category || 'Exterior'}
                    onChange={(e) => handleUpdateMedia(photo.id, { category: e.target.value })}
                    className={`${selectClass} w-full`}
                  >
                    {PHOTO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDeleteMedia(photo.id)}
                    className="text-gc-negative hover:text-red-400 text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- Section 2: Documents ---- */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gc-text">Documents</h2>
          <button
            onClick={() => setShowDocForm((v) => !v)}
            className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showDocForm ? 'Cancel' : 'Add Document'}
          </button>
        </div>

        {/* Add document inline form */}
        {showDocForm && (
          <div className="mb-6 bg-gc-bg border border-gc-border rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="Document title"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className={inputClass}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Document URL (or upload PDF below)"
                value={newDocUrl}
                onChange={(e) => setNewDocUrl(e.target.value)}
                className={`${inputClass} flex-1 min-w-[200px]`}
              />
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadDocument(file);
                  e.target.value = '';
                }}
                ref={docFileInputRef}
              />
              <button
                type="button"
                onClick={() => docFileInputRef.current?.click()}
                disabled={uploadingDoc}
                className="bg-gc-surface-elevated hover:bg-gc-border border border-gc-border text-gc-text text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {uploadingDoc ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={newDocRole}
                onChange={(e) => setNewDocRole(e.target.value as DocumentRole)}
                className={selectClass}
              >
                {DOCUMENT_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                className={selectClass}
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddDocument}
                disabled={addingDoc || !newDocTitle.trim() || !newDocUrl.trim()}
                className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {addingDoc ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Document table */}
        {documents.length === 0 ? (
          <p className="text-gc-text-secondary text-sm">
            No documents yet. Add investment documents for the deal.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gc-border">
                  <th className="text-left py-3 pr-4 text-gc-text-secondary font-medium">Title</th>
                  <th className="text-left py-3 pr-4 text-gc-text-secondary font-medium">Role</th>
                  <th className="text-left py-3 pr-4 text-gc-text-secondary font-medium">Type</th>
                  <th className="text-left py-3 pr-4 text-gc-text-secondary font-medium">URL</th>
                  <th className="text-right py-3 text-gc-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gc-border/50">
                    <td className="py-3 pr-4">
                      <input
                        type="text"
                        value={doc.label || ''}
                        onChange={(e) => handleUpdateMedia(doc.id, { label: e.target.value })}
                        className="bg-gc-bg border border-gc-border rounded px-2 py-1 text-sm text-gc-text w-full focus:outline-none focus:border-gc-accent-light"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={doc.document_role || 'other'}
                        onChange={(e) => handleUpdateMedia(doc.id, { document_role: e.target.value as DocumentRole || 'other' })}
                        className="bg-gc-bg border border-gc-border rounded px-2 py-1 text-sm text-gc-text focus:outline-none focus:border-gc-accent-light"
                      >
                        {DOCUMENT_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-gc-text-secondary">{doc.category || 'PDF'}</td>
                    <td className="py-3 pr-4">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gc-accent-light hover:underline text-sm truncate block max-w-[240px]"
                      >
                        {doc.url}
                      </a>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteMedia(doc.id)}
                        className="text-gc-negative hover:text-red-400 text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Section 3: Video ---- */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gc-text mb-4">Video</h2>
        <p className="text-sm text-gc-text-muted mb-3">YouTube or Vimeo embed URL, or direct link to an MP4/WebM file for the Deal Walkthrough section.</p>

        <input
          type="text"
          placeholder="YouTube, Vimeo, or direct MP4/WebM URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className={`${inputClass} mb-4`}
        />

        {/* Embed preview */}
        {videoUrl.trim() && isEmbeddable(videoUrl) && embedUrl && (
          <div className="mb-4 aspect-video rounded-lg overflow-hidden border border-gc-border">
            <iframe
              src={embedUrl}
              title="Video preview"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Save button + message */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveVideo}
            disabled={savingVideo}
            className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {savingVideo ? 'Saving...' : 'Save Video URL'}
          </button>
          {videoMsg && (
            <span
              className={`text-sm ${videoMsg.type === 'success' ? 'text-gc-positive' : 'text-gc-negative'}`}
            >
              {videoMsg.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
